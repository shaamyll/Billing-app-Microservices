"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JWTService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = require("./config/dotenv");
class JWTService {
    /**
     * Generate access token
     */
    static generateAccessToken(payload) {
        const tokenPayload = {
            ...payload,
            tokenType: 'access',
        };
        return jsonwebtoken_1.default.sign(tokenPayload, this.ACCESS_TOKEN_SECRET, {
            expiresIn: this.getExpirationTime(this.ACCESS_TOKEN_EXPIRES_IN),
        });
    }
    /**
     * Generate refresh token
     */
    static generateRefreshToken(payload) {
        const tokenPayload = {
            ...payload,
            tokenType: 'refresh',
        };
        return jsonwebtoken_1.default.sign(tokenPayload, this.REFRESH_TOKEN_SECRET, {
            expiresIn: this.getExpirationTime(this.REFRESH_TOKEN_EXPIRES_IN),
        });
    }
    /**
     * Generate token pair (access + refresh)
     */
    static generateTokenPair(payload) {
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
    static verifyAccessToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.ACCESS_TOKEN_SECRET);
            if (decoded.tokenType !== 'access') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Access token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid access token');
            }
            throw new Error('Token verification failed');
        }
    }
    /**
     * Verify refresh token
     */
    static verifyRefreshToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.REFRESH_TOKEN_SECRET);
            if (decoded.tokenType !== 'refresh') {
                throw new Error('Invalid token type');
            }
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Refresh token expired');
            }
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid refresh token');
            }
            throw new Error('Token verification failed');
        }
    }
    /**
     * Decode token without verification (for debugging)
     */
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch {
            return null;
        }
    }
    /**
     * Generate secure random token for additional security
     */
    static generateSecureToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    /**
     * Get token expiration time in seconds
     */
    static getExpirationTime(expiresIn) {
        const timeMap = {
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
    static isTokenExpired(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return true;
            }
            return decoded.exp * 1000 < Date.now();
        }
        catch {
            return true;
        }
    }
    /**
     * Get token remaining time in seconds
     */
    static getTokenRemainingTime(token) {
        try {
            const decoded = this.decodeToken(token);
            if (!decoded || !decoded.exp) {
                return 0;
            }
            const remaining = decoded.exp * 1000 - Date.now();
            return Math.max(0, Math.floor(remaining / 1000));
        }
        catch {
            return 0;
        }
    }
    /**
     * Refresh access token using refresh token
     */
    static refreshToken(refreshToken) {
        // Verify refresh token
        const payload = this.verifyRefreshToken(refreshToken);
        // Remove tokenType from payload
        const { tokenType, ...refreshPayload } = payload;
        // Generate new token pair
        return this.generateTokenPair(refreshPayload);
    }
}
exports.JWTService = JWTService;
JWTService.ACCESS_TOKEN_SECRET = dotenv_1.env.JWT_SECRET;
JWTService.REFRESH_TOKEN_SECRET = dotenv_1.env.JWT_REFRESH_SECRET;
JWTService.ACCESS_TOKEN_EXPIRES_IN = dotenv_1.env.JWT_EXPIRES_IN;
JWTService.REFRESH_TOKEN_EXPIRES_IN = dotenv_1.env.JWT_REFRESH_EXPIRES_IN;
exports.default = JWTService;
