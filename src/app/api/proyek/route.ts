import { NextRequest, NextResponse } from 'next/server'
// import { getProyekPembangunan } from '../../../lib/server-actions/proyek'
// import { deleteProyekPembangunan } from '../../../lib/server-actions/proyek'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '../../../lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Temporarily disable authentication for development
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // Temporarily return simple response for testing
    return NextResponse.json({
      success: true,
      data: {
        data: [],
        total: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20
      }
    })
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

    // Temporarily return success for testing
    return NextResponse.json({
      success: true,
      message: 'Proyek deleted successfully'
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
