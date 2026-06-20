import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { UserRole } from './models/User';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'super_secret_samadhan_jwt_key_please_change_in_production'
);

const REFRESH_SECRET = new TextEncoder().encode(
  process.env.REFRESH_SECRET || 'super_secret_samadhan_refresh_key_please_change_in_production'
);

export interface TokenPayload {
  userId: string;
  role: UserRole;
  department?: string;
}

export async function signAccessToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET);
}

export async function signRefreshToken(payload: TokenPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(REFRESH_SECRET);
}

export async function verifyAccessToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function verifyRefreshToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload as unknown as TokenPayload;
  } catch (error) {
    return null;
  }
}
