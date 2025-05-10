import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";
import User from "../models/user.js";
import {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRES_IN,
} from "../config/server.config.js";

class AuthService {
  /**
   * Register a new user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Registered user details
   */
  static async register(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    if (!user) {
      throw new Error("User registration failed");
    }

    return {
      id: user.id,
      email: user.email,
      message: "User registered successfully",
    };
  }

  /**
   * Login a user
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Promise<Object>} - Access and refresh tokens
   */
  static async login(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
      },
      ...tokens,
    };
  }

  /**
   * Generate access and refresh tokens
   * @param {Object} user - User object
   * @returns {Promise<Object>} - Access and refresh tokens
   */
  static async generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });


    // Store refresh token in Redis
    await redisClient.set(`refreshToken:${user.id}`, refreshToken, {
      EX: parseInt(REFRESH_TOKEN_EXPIRES_IN, 10),
    });


    return { accessToken, refreshToken };
  }

  /**
   * Validate a refresh token
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - Decoded token payload
   */
  static async validateRefreshToken(refreshToken) {
    try {

      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      const storedToken = await redisClient.get(`refreshToken:${decoded.id}`);

      if (storedToken !== refreshToken) {
        throw new Error("Invalid refresh token");
      }

      return decoded;
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        console.error("Refresh token expired:", error.expiredAt); // Debugging log
        throw new Error("Refresh token has expired. Please log in again.");
      }
      console.error("Error validating refresh token:", error); // Debugging log
      throw new Error("Invalid or expired refresh token");
    }
  }
  /**
   * Revoke a refresh token
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  static async revokeRefreshToken(userId) {
    await redisClient.del(`refreshToken:${userId}`);
  }

  /**
   * Refresh access and refresh tokens
   * @param {string} refreshToken - Refresh token
   * @returns {Promise<Object>} - New access and refresh tokens
   */
  static async refreshTokens(refreshToken) {
    const decoded = await this.validateRefreshToken(refreshToken);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error("User not found");
    }

    return this.generateTokens(user);
  }
}

export default AuthService;
