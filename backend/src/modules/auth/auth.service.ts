import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { eq, count } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as bcrypt from 'bcryptjs';
import { DB_TOKEN } from '../../database/database.provider';
import * as schema from '../../database/schema/index';
import { AUTH_ERROR } from '../../common/constants/auth.constants';
import { type LoginDto, type SetupDto, type RefreshDto, type AuthTokens, type UserInfo } from './schemas/auth.schemas';

const BCRYPT_ROUNDS = 12;
const REFRESH_TOKEN_EXPIRY = '7d';

type DrizzleDB = NodePgDatabase<typeof schema>;

@Injectable()
export class AuthService {
  constructor(
    @Inject(DB_TOKEN) private readonly db: DrizzleDB,
    private readonly jwtService: JwtService,
  ) {}

  async setup(dto: SetupDto): Promise<{ message: string }> {
    const existingCount = await this.db.select({ value: count() }).from(schema.users);
    const total = existingCount[0]?.value ?? 0;
    if (total > 0) {
      throw new ConflictException(AUTH_ERROR.SETUP_ALREADY_DONE);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.db.insert(schema.users).values({
      email: dto.email,
      passwordHash,
    });

    return { message: 'Owner account created successfully' };
  }

  async login(dto: LoginDto): Promise<AuthTokens> {
    const rows = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, dto.email))
      .limit(1);

    const user = rows[0];
    if (user === undefined) {
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AUTH_ERROR.ACCOUNT_INACTIVE);
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedException(AUTH_ERROR.INVALID_CREDENTIALS);
    }

    await this.db
      .update(schema.users)
      .set({ lastLoginAt: new Date() })
      .where(eq(schema.users.id, user.id));

    return this.generateTokens(user.id, user.email, user.role);
  }

  async refresh(dto: RefreshDto): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; email: string; role: string }>(dto.refreshToken);
      const accessToken = this.jwtService.sign(
        { sub: payload.sub, email: payload.email, role: payload.role },
      );
      return { accessToken };
    } catch {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }
  }

  async getMe(userId: string): Promise<UserInfo> {
    const rows = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, userId))
      .limit(1);

    const user = rows[0];
    if (user === undefined) {
      throw new UnauthorizedException(AUTH_ERROR.TOKEN_INVALID);
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      lastLoginAt: user.lastLoginAt,
    };
  }

  private generateTokens(userId: string, email: string, role: string): AuthTokens {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
  }
}
