import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/index.js";
import type { JwtPayload } from "../types/index.js";

type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as ExpiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  return decoded as JwtPayload;
};
