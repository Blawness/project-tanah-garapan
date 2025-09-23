import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub,
          role: token.role,
        }
      }
    },
  },
  pages: {
    signIn: '/login',
  },
}

// Role hierarchy for authorization
export const ROLE_HIERARCHY = {
  USER: 1,
  MANAGER: 2,
  ADMIN: 3,
  DEVELOPER: 4
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  return ROLE_HIERARCHY[userRole as keyof typeof ROLE_HIERARCHY] >= 
         ROLE_HIERARCHY[requiredRole as keyof typeof ROLE_HIERARCHY]
}

export function canManageData(userRole: string): boolean {
  return hasPermission(userRole, 'MANAGER')
}

export function canViewLogs(userRole: string): boolean {
  return hasPermission(userRole, 'ADMIN')
}
