import { NextRequest, NextResponse } from 'next/server'
import { detectPDFOrientation } from '@/lib/pdfToImages'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pdfUrl } = body

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      )
    }

    const orientation = await detectPDFOrientation(pdfUrl)

    return NextResponse.json({
      success: true,
      orientation,
    })
  } catch (error) {
    console.error('Error detecting orientation:', error)
    return NextResponse.json(
      { error: 'Failed to detect orientation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

