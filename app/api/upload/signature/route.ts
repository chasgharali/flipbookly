import { NextResponse } from 'next/server'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Generate upload signature for direct client-side upload
    const timestamp = Math.round(new Date().getTime() / 1000)
    const folder = 'flipbookly/pdfs'
    const resource_type = 'raw'
    
    // Parameters must be sorted alphabetically for signature
    // Format: param1=value1&param2=value2 (sorted alphabetically)
    const params: Record<string, string> = {
      folder,
      resource_type,
      timestamp: timestamp.toString(),
    }
    
    // Sort parameters alphabetically and create signature string
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&')
    
    // Generate SHA-1 signature
    const signature = crypto
      .createHash('sha1')
      .update(sortedParams + (process.env.CLOUDINARY_API_SECRET || ''))
      .digest('hex')

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder,
      resourceType: resource_type,
    })
  } catch (error) {
    console.error('Error generating upload signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate upload signature' },
      { status: 500 }
    )
  }
}



