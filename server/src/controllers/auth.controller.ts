import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../lib/prisma.js";
/**
 * Register a new user
 * @param req - Express request with body: { name, email, password }
 * @param res - Express response with { user, token }
 *
 */
export const register = async (req: Request, res: Response) => {
  // TODO: Implement registration logic
  const { name, email, password, profileAvatar } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        profileAvatar: profileAvatar || null,
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: "24h" });

    return res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        profileAvatar: newUser.profileAvatar,
      },
    });
  } catch (error) {
    console.error("Registration error: ", error);
    return res.status(500).json({
      error: "Registration failed",
    });
  }
};

/**
 * Login an existing user
 * @param req - Express request with body: { email, password }
 * @param res - Express response with { user, token }
 *
 * Steps to implement:
 * 1. Extract email, password from req.body
 * 2. Find user by email in database
 * 3. If no user found, return 401 error
 * 4. Compare password with hashed password using bcrypt
 * 5. If passwords don't match, return 401 error
 * 6. Generate JWT token with user.id
 * 7. Return { user: { id, email, name, profileAvatar }, token }
 */
export const login = async (req: Request, res: Response) => {
  // TODO: Implement login logic
  const { email, password } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    const token = jwt.sign({ userId: existingUser.id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      token: token,
      user: {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        profileAvatar: existingUser.profileAvatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      error: "Login failed",
    });
  }
};
