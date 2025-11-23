import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { convertPDFToImages } from '@/lib/pdfToImages'
import { nanoid } from 'nanoid'
import { getUserFromToken, getTokenFromRequest } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfUrl, title, orientation, userId } = body

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      )
    }

    // Generate unique slug
    const slug = nanoid(12)

    // Convert PDF to images
    let conversionResult
    try {
      conversionResult = await convertPDFToImages({ 
        pdfUrl, 
        orientation: orientation || undefined 
      })
    } catch (pdfError) {
      console.error('PDF conversion error:', pdfError)
      return NextResponse.json(
        { 
          error: 'Failed to convert PDF to images', 
          details: pdfError instanceof Error ? pdfError.message : 'Unknown error',
          hint: 'Please ensure you are using Node.js 18 or higher'
        },
        { status: 500 }
      )
    }

    if (conversionResult.pageImageUrls.length === 0) {
      return NextResponse.json(
        { error: 'No pages found in PDF' },
        { status: 400 }
      )
    }

    // Save to database - prioritize user-selected orientation over detected
    const flipbook = await prisma.flipbook.create({
      data: {
        slug,
        pdfUrl,
        pages: conversionResult.pageImageUrls,
        title: title || 'Untitled Flipbook',
        orientation: orientation || conversionResult.detectedOrientation || null,
        userId: userId || null,
      },
    })

    return NextResponse.json({
      success: true,
      flipbook: {
        id: flipbook.id,
        slug: flipbook.slug,
        pages: flipbook.pages,
        createdAt: flipbook.createdAt,
        title: flipbook.title,
        orientation: flipbook.orientation,
      },
    })
  } catch (error) {
    console.error('Error creating flipbook:', error)
    return NextResponse.json(
      { error: 'Failed to create flipbook', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    let userId: string | undefined

    if (token) {
      const user = await getUserFromToken(token)
      if (user) {
        userId = user.id
      }
    }

    const flipbooks = await prisma.flipbook.findMany({
      where: userId ? { userId } : undefined,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        slug: true,
        title: true,
        createdAt: true,
        pages: true,
        orientation: true,
      },
    })

    return NextResponse.json({ flipbooks })
  } catch (error) {
    console.error('Error fetching flipbooks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch flipbooks' },
      { status: 500 }
    )
  }
}

