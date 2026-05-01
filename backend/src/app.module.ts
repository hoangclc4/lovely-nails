import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv } from './config/env.config';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { RedisModule } from './modules/redis/redis.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { SalonScheduleModule } from './modules/salon-schedule/salon-schedule.module';
import { EmployeeScheduleModule } from './modules/employee-schedule/employee-schedule.module';
import { ServiceCategoriesModule } from './modules/service-categories/service-categories.module';
import { ServicesModule } from './modules/services/services.module';
import { ServiceAddOnsModule } from './modules/service-add-ons/service-add-ons.module';
import { ServiceSessionsModule } from './modules/service-sessions/service-sessions.module';
import { TipsModule } from './modules/tips/tips.module';
import { SalariesModule } from './modules/salaries/salaries.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReportsModule } from './modules/reports/reports.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AuthModule } from './modules/auth/auth.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { SessionPhotosModule } from './modules/session-photos/session-photos.module';
import { PublicModule } from './modules/public/public.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: false,
        redact: ['req.headers.authorization'],
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:HH:MM:ss',
                  ignore: 'pid,hostname',
                  messageFormat: '{context} {msg}',
                  singleLine: false,
                },
              }
            : undefined,
      },
    }),
    DatabaseModule,
    RedisModule,
    EmployeesModule,
    ShiftsModule,
    BookingsModule,
    SalonScheduleModule,
    EmployeeScheduleModule,
    ServiceCategoriesModule,
    ServicesModule,
    ServiceAddOnsModule,
    ServiceSessionsModule,
    TipsModule,
    SalariesModule,
    DashboardModule,
    ReportsModule,
    CustomersModule,
    SettingsModule,
    AuthModule,
    IncidentsModule,
    SessionPhotosModule,
    PublicModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
