import { JWTService } from '@billing/utils';
import { env } from './dotenv';

export const jwtService = new JWTService({
  accessSecret: env.JWT_SECRET,
  refreshSecret: env.JWT_REFRESH_SECRET,
  accessExpiresIn: env.JWT_EXPIRES_IN,
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN,
});