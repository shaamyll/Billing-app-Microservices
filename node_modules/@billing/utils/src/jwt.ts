import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from './config/dotenv';

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  tokenType: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export class JWTService {
  private static readonly ACCESS_TOKEN_SECRET = env.JWT_SECRET;
  private static readonly REFRESH_TOKEN_SECRET = env.JWT_REFRESH_SECRET;
  private static readonly ACCESS_TOKEN_EXPIRES_IN = env.JWT_EXPIRES_IN;
  private static readonly REFRESH_TOKEN_EXPIRES_IN = env.JWT_REFRESH_EXPIRES_IN || '15d';

  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      tokenType: 'access',
    };

    return jwt.sign(tokenPayload, this.ACCESS_TOKEN_SECRET, {
      expiresIn: this.getExpirationTime(this.ACCESS_TOKEN_EXPIRES_IN),
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      tokenType: 'refresh',
    };

    return jwt.sign(tokenPayload, this.REFRESH_TOKEN_SECRET, {
      expiresIn: this.getExpirationTime(this.REFRESH_TOKEN_EXPIRES_IN),
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(payload: Omit<JWTPayload, 'tokenType'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.getExpirationTime(this.ACCESS_TOKEN_EXPIRES_IN),
      refreshTokenExpiresIn: this.getExpirationTime(this.REFRESH_TOKEN_EXPIRES_IN),
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.ACCESS_TOKEN_SECRET) as JWTPayload;

      if (decoded.tokenType !== 'access') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Access token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid access token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.REFRESH_TOKEN_SECRET) as JWTPayload;

      if (decoded.tokenType !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Token verification failed');
    }
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwt.decode(token) as JWTPayload;
    } catch {
      return null;
    }
  }

  /**
   * Generate secure random token for additional security
   */
  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Get token expiration time in seconds
   */
  private static getExpirationTime(expiresIn: string): number {
    const timeMap: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800,
      y: 31536000,
    };

    const match = expiresIn.match(/^(\d+)([smhdwy])$/);
    if (!match) {
      // If format is not recognized, use default 15 minutes
      return 15 * 60;
    }

    const [, value, unit] = match;
    return parseInt(value) * timeMap[unit];
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return true;
      }

      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Get token remaining time in seconds
   */
  static getTokenRemainingTime(token: string): number {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return 0;
      }

      const remaining = decoded.exp * 1000 - Date.now();
      return Math.max(0, Math.floor(remaining / 1000));
    } catch {
      return 0;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static refreshToken(refreshToken: string): TokenPair {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Remove tokenType from payload
    const { tokenType, ...refreshPayload } = payload;

    // Generate new token pair
    return this.generateTokenPair(refreshPayload);
  }
}

export default JWTService;