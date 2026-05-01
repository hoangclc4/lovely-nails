export const USER_ROLE = {
  OWNER: 'owner',
} as const;

export const AUTH_ERROR = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_INACTIVE: 'Account is inactive',
  SETUP_ALREADY_DONE: 'Owner account already exists',
  TOKEN_INVALID: 'Invalid token',
} as const;

export const JWT_STRATEGY_NAME = 'jwt';
export const IS_PUBLIC_KEY = 'isPublic';
