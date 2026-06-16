import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'salao-reflexus-secret-key-2024'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser
  } catch {
    return null
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user || !user.active) return null

  const isValid = await verifyPassword(password, user.password)
  if (!isValid) return null

  const token = generateToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  })

  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token }
}

export function getTokenFromCookies(cookies: string): string | null {
  const match = cookies.match(/auth-token=([^;]+)/)
  return match ? match[1] : null
}
