import jwt from "jsonwebtoken";
import { env } from "../config/index.js";
import type { JwtPayload } from "../types/index.js";

export const signToken = (payload: JwtPayload): string => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as JwtPayload;
};
