import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'zargoon-pharmacy-secret-key-2024'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'zargoon-refresh-secret-key-2024'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateAccessToken(payload: { userId: string; email: string; role: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
}

export function generateRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
}

export function verifyAccessToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
  } catch {
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: string }
  } catch {
    return null
  }
}

export const ROLES = {
  super_admin: { label: 'Super Admin', level: 0 },
  admin: { label: 'Admin', level: 1 },
  manager: { label: 'Manager', level: 2 },
  pharmacist: { label: 'Pharmacist', level: 3 },
  cashier: { label: 'Cashier', level: 4 },
  staff: { label: 'Staff', level: 5 },
  customer: { label: 'Customer', level: 6 },
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLES[userRole as keyof typeof ROLES]?.level ?? 99
  const requiredLevel = ROLES[requiredRole as keyof typeof ROLES]?.level ?? 99
  return userLevel <= requiredLevel
}
