import { NextRequest, NextResponse } from 'next/server'
import { getProyekPembangunan, deleteProyekPembangunan } from '../../../lib/server-actions/proyek'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for development
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Temporarily return simple response for testing
    // return NextResponse.json({
    //   success: true,
    //   data: {
    //     data: [],
    //     total: 0,
    //     totalPages: 0,
    //     currentPage: 1,
    //     pageSize: 20
    //   }
    // })

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')
    const limit = parseInt(searchParams.get('limit') || pageSize.toString())

    const result = await getProyekPembangunan(page, limit)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Proyek ID is required' },
        { status: 400 }
      )
    }

    const result = await deleteProyekPembangunan(id)

    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
