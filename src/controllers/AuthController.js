import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../config/db.js';

import { AuthService } from '../services/AuthService.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

/**
 * AuthController - Handles HTTP requests for authentication.
 * Delegates business logic to AuthService (Separation of Concerns).
 */
export class AuthController {

  /**
   * POST /api/v1/auth/register
   * Register a new customer with full profile data.
   */
  static register = asyncHandler(async (req, res) => {
    const {
      name,
      email,
      password,
      passwordConfirmation,
      address,
      phone
    } = req.body;

    // Validate required fields
    if (!email || !password || !passwordConfirmation) {
      throw new AppError(
        'Email, password, and password confirmation are required',
        400
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      throw new AppError('Invalid email format', 400);
    }

    // Validate password confirmation match
    if (password !== passwordConfirmation) {
      throw new AppError(
        'Password and password confirmation do not match',
        400
      );
    }

    const result = await AuthService.register({
      email,
      password,
      passwordConfirmation,
      name,
      address,
      phone,
    });

    res.success(
      {
        user: result.user,
        token: result.token,
      },
      'User registered successfully',
      201
    );
  });

  /**
   * POST /api/v1/auth/login
   * Authenticate user and return token
   */
  static login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(
        'Email and password are required',
        400
      );
    }

    const result = await AuthService.login({
      email,
      password
    });

    res.success(
      {
        user: result.user,
        token: result.token,
      },
      'Login successful',
      200
    );
  });

  /**
   * GET /api/v1/auth/me
   * Get current authenticated user profile
   */

  static activateAccount = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new AppError('Token dan password wajib diisi', 400);
  }

  let decoded;

  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new AppError('Token tidak valid atau kadaluarsa', 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: {
      email: decoded.email,
    },
    data: {
      password: hashedPassword,
      isActive: true,
      activationToken: null,
    },
  });

  res.success(
    {
      id: user.id,
      email: user.email,
    },
    'Akun berhasil diaktivasi',
    200
  );
});

  static getCurrentUser = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user =
      await AuthService.getCurrentUser(userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.success(
      user,
      'Current user fetched successfully',
      200
    );
  });

  /**
   * POST /api/v1/auth/activate-account
   * Activate invited account and set password
   */
  static activateAccount = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
      throw new AppError(
        'Token dan password wajib diisi',
        400
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );
    } catch (error) {
      throw new AppError(
        'Token tidak valid atau kadaluarsa',
        400
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        email: decoded.email,
        activationToken: token,
      },
    });

    if (!user) {
      throw new AppError(
        'User tidak ditemukan',
        404
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
        isActive: true,
        activationToken: null,
      },
    });

    res.success(
      null,
      'Akun berhasil diaktivasi',
      200
    );
  });

  /**
   * POST /api/v1/auth/logout
   * Logout user
   */
  static logout = asyncHandler(async (req, res) => {

    // Token blacklisting dapat diimplementasikan di sini jika diperlukan

    res.success(
      null,
      'You have been logged out',
      200
    );
  });
}