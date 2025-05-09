import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/server.config.js';
import User from '../models/user.js';

export default class AuthService {
  static async register(email, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });
    if (!user) {
      throw new Error('User registration failed');
    }
    const responseRegister = {
      id: user.id,
      email: user.email,
      success: true,
      message: 'User registered successfully',
    };
    return responseRegister;
  }

  static async login(email, password) {
    try {
      // Check if the user exists
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return { success: false, message: 'User not found' };
      }
  
      // Validate the password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return { success: false, message: 'Invalid credentials' };
      }
      console.log('token', JWT_SECRET);
      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );
  
      // Return success response
      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      };
    } catch (error) {
      console.error('Error during login:', error.message);
      throw new Error('An error occurred during login. Please try again later.');
    }
  }
}