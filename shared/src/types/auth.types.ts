// Authentication Types
// Base User type is imported from @prisma/client
// This file contains API request/response types and safe user type (without password)

// Safe user type for frontend (excludes password)
export type SafeUser = {
  id: string;
  email: string;
  name: string;
  profileAvatar: string | null;
};

// Login request
export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  user: SafeUser;
  token: string;
};

// Register request
export type RegisterRequest = {
  email: string;
  password: string;
  name: string;
  profileAvatar?: string;
};

export type RegisterResponse = {
  user: SafeUser;
  token: string;
};
