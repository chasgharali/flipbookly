import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    const flipbook = await prisma.flipbook.findUnique({
      where: { slug },
    })

    if (!flipbook) {
      return NextResponse.json(
        { error: 'Flipbook not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ flipbook })
  } catch (error) {
    console.error('Error fetching flipbook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flipbook' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const token = getTokenFromRequest(request)

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Find flipbook
    const flipbook = await prisma.flipbook.findUnique({
      where: { slug },
    })

    if (!flipbook) {
      return NextResponse.json(
        { error: 'Flipbook not found' },
        { status: 404 }
      )
    }

    // Check if user owns the flipbook
    if (flipbook.userId !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete flipbook
    await prisma.flipbook.delete({
      where: { slug },
    })

    return NextResponse.json({
      success: true,
      message: 'Flipbook deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting flipbook:', error)
    return NextResponse.json(
      { error: 'Failed to delete flipbook' },
      { status: 500 }
    )
  }
}
