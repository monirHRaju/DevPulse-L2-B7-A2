import bcrypt from "bcrypt";
import { StatusCodes } from "http-status-codes";
import { pool } from "../../database/index.js";
import { env } from "../../config/index.js";
import { AppError } from "../../utility/AppError.js";
import { signToken } from "../../utility/jwt.js";
import type {
  SignupBody,
  LoginBody,
  PublicUser,
  User,
} from "../../types/index.js";

export const signupUser = async (body: SignupBody): Promise<PublicUser> => {
  const { name, email, password, role } = body;

  const existing = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1",
    [email]
  );
  if (existing.rows.length > 0) {
    throw new AppError(StatusCodes.CONFLICT, "Email is already registered");
  }

  const hashed = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
  const finalRole = role ?? "contributor";

  const result = await pool.query<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [name, email, hashed, finalRole]
  );

  return result.rows[0]!;
};

export const loginUser = async (
  body: LoginBody
): Promise<{ token: string; user: PublicUser }> => {
  const { email, password } = body;

  const result = await pool.query<User>(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email]
  );

  const user = result.rows[0];
  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
  }

  const token = signToken({ id: user.id, name: user.name, role: user.role });

  const publicUser: PublicUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };

  return { token, user: publicUser };
};
