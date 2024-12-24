// src/services/authService.ts
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { authConfig } from '../config/auth.config';

interface TokenPayload {
  id: string;
  email?: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: Types.ObjectId;
    email: string;
  };
}

export class AuthService {
  static generateToken(userId: Types.ObjectId | string): string {
    const userIdString = userId.toString();
    return jwt.sign(
      { id: userIdString },
      authConfig.jwt.secret,
      { expiresIn: authConfig.jwt.expiresIn }
    );
  }

  static async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = jwt.verify(token, authConfig.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async createOrUpdateUser(email: string): Promise<IUser> {
    const user = await User.findOneAndUpdate(
      { email },
      { 
        $setOnInsert: { 
          created_at: new Date(),
          email: email,
          lastLogin: new Date()
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!user) {
      throw new Error('Failed to create or update user');
    }

    return user;
  }

  static async authenticateWithGoogle(accessToken: string): Promise<AuthResponse> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const data = await response.json();
      
      if (!data.email) {
        throw new Error('No email found in Google account');
      }

      const user = await this.createOrUpdateUser(data.email);

      // Ensure user._id exists and is of type ObjectId
      if (!user?._id) {
        throw new Error('User ID is missing');
      }

      const token = this.generateToken(user._id);

      return {
        token,
        user: {
          id: user._id,
          email: user.email
        }
      };
    } catch (error) {
      console.error('Google authentication error:', error);
      throw new Error('Google authentication failed');
    }
  }

  static async refreshToken(refreshToken: string): Promise<string> {
    try {
      const decoded = jwt.verify(refreshToken, authConfig.jwt.refreshSecret) as TokenPayload;
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      return this.generateToken(user._id);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  static async validateEmail(email: string): Promise<boolean> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}