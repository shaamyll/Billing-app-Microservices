import jwt from 'jsonwebtoken';
import crypto from 'crypto';

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

export interface JWTConfig {
  accessSecret: string;
  refreshSecret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
}

/**
 * JWTService is now instance-based and environment-agnostic.
 * Callers (microservices) own their configuration and pass it in
 * via the constructor. No process.env / dotenv is read here.
 */
export class JWTService {
  private readonly config: JWTConfig;

  constructor(config: JWTConfig) {
    this.config = config;
  }

  /**
   * Generate access token
   */
  generateAccessToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      tokenType: 'access',
    };

    return jwt.sign(tokenPayload, this.config.accessSecret, {
      expiresIn: this.getExpirationTime(this.config.accessExpiresIn),
    });
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload: Omit<JWTPayload, 'tokenType'>): string {
    const tokenPayload: JWTPayload = {
      ...payload,
      tokenType: 'refresh',
    };

    return jwt.sign(tokenPayload, this.config.refreshSecret, {
      expiresIn: this.getExpirationTime(this.config.refreshExpiresIn),
    });
  }

  /**
   * Generate token pair (access + refresh)
   */
  generateTokenPair(payload: Omit<JWTPayload, 'tokenType'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresIn: this.getExpirationTime(this.config.accessExpiresIn),
      refreshTokenExpiresIn: this.getExpirationTime(this.config.refreshExpiresIn),
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.config.accessSecret) as JWTPayload;

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
  verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, this.config.refreshSecret) as JWTPayload;

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
  decodeToken(token: string): JWTPayload | null {
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
  private getExpirationTime(expiresIn: string): number {
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
  isTokenExpired(token: string): boolean {
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
  getTokenRemainingTime(token: string): number {
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
  refreshToken(refreshToken: string): TokenPair {
    // Verify refresh token
    const payload = this.verifyRefreshToken(refreshToken);

    // Remove tokenType from payload
    const { tokenType, ...refreshPayload } = payload;

    // Generate new token pair
    return this.generateTokenPair(refreshPayload);
  }
}

export default JWTService;