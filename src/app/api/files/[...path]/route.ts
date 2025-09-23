import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const filePath = params.path.join('/')
    const fullPath = path.join(process.cwd(), 'uploads', filePath)

    if (!existsSync(fullPath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Security check: ensure the file is within the uploads directory
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const resolvedPath = path.resolve(fullPath)
    const resolvedUploadsDir = path.resolve(uploadsDir)

    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return new NextResponse('Access denied', { status: 403 })
    }

    const file = await readFile(fullPath)
    
    // Determine content type based on file extension
    const ext = path.extname(fullPath).toLowerCase()
    const contentTypes: { [key: string]: string } = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
    }

    const contentType = contentTypes[ext] || 'application/octet-stream'

    return new NextResponse(file, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    })

  } catch (error) {
    console.error('File serving error:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
