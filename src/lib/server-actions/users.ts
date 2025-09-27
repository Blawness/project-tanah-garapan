'use server'

import { prisma } from '@/lib/prisma'
import { UserFormData, userSchema, ApiResponse } from '@/lib/types'
// import { revalidatePath } from 'next/cache' // Temporarily removed for client compatibility
import { getServerSession } from 'next-auth'
import { authOptions, canViewLogs } from '@/lib/auth'
import { logActivity } from './activity'
import bcrypt from 'bcryptjs'

export async function getUsers(): Promise<ApiResponse<any[]>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, data: users }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { success: false, error: 'Failed to fetch users' }
  }
}

export async function createUser(data: UserFormData): Promise<ApiResponse<any>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const validatedData = userSchema.parse(data)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12)

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    await logActivity(
      session.user.name,
      'CREATE_USER',
      `Created new user: ${user.email}`,
      { userId: user.id, userRole: user.role }
    )

    // revalidatePath('/users') // Temporarily disabled for client compatibility
    return { success: true, data: user, message: 'User created successfully' }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(id: string, data: Partial<UserFormData>): Promise<ApiResponse<any>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return { success: false, error: 'User not found' }
    }

    const updateData: any = {}

    if (data.email) updateData.email = data.email
    if (data.name) updateData.name = data.name
    if (data.role) updateData.role = data.role
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 12)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    await logActivity(
      session.user.name,
      'UPDATE_USER',
      `Updated user: ${user.email}`,
      { userId: user.id, changes: updateData }
    )

    // revalidatePath('/users') // Temporarily disabled for client compatibility
    return { success: true, data: user, message: 'User updated successfully' }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function deleteUser(id: string): Promise<ApiResponse<void>> {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session || !canViewLogs(session.user.role)) {
    //   return { success: false, error: 'Unauthorized' }
    // }

    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return { success: false, error: 'User not found' }
    }

    // Don't allow deleting yourself
    if (existingUser.id === session.user.id) {
      return { success: false, error: 'Cannot delete your own account' }
    }

    await prisma.user.delete({
      where: { id }
    })

    await logActivity(
      session.user.name,
      'DELETE_USER',
      `Deleted user: ${existingUser.email}`,
      { userId: existingUser.id, userRole: existingUser.role }
    )

    // revalidatePath('/users') // Temporarily disabled for client compatibility
    return { success: true, message: 'User deleted successfully' }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}
