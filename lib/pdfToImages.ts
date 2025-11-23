import { createCanvas } from '@napi-rs/canvas'
import { uploadToCloudinary } from './cloudinary'

// Polyfill for Promise.withResolvers (Node.js 18 compatibility)
// Must be defined before any pdfjs-dist import
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void
    let reject!: (reason?: any) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }
}

interface ConvertPDFToImagesOptions {
  pdfUrl: string
  orientation?: 'portrait' | 'landscape'
}

interface ConvertPDFToImagesResult {
  pageImageUrls: string[]
  detectedOrientation: 'portrait' | 'landscape' | null
}

export async function convertPDFToImages({ pdfUrl, orientation }: ConvertPDFToImagesOptions): Promise<ConvertPDFToImagesResult> {
  try {
    // Disable worker before loading pdfjs-dist
    // This prevents worker setup errors in Node.js/serverless environments
    if (typeof global !== 'undefined') {
      (global as any).pdfjsWorker = null
    }
    
    // Use require for CommonJS import to avoid ESM issues
    // This ensures the polyfill is applied before pdfjs-dist loads
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

    // Disable worker in Node.js environment (not needed for server-side rendering)
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''

    // Fetch the PDF
    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const pageImageUrls: string[] = []
    const numPages = pdf.numPages

    // Detect orientation from first page if not provided
    let detectedOrientation: 'portrait' | 'landscape' | null = null
    if (!orientation && numPages > 0) {
      const firstPage = await pdf.getPage(1)
      const viewport = firstPage.getViewport({ scale: 1.0 })
      detectedOrientation = viewport.width > viewport.height ? 'landscape' : 'portrait'
    }

    // Use provided orientation or detected one
    const finalOrientation = orientation || detectedOrientation

    // Convert each page to an image
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)

      // Set scale for high quality (2x for retina)
      const scale = 2.0
      const viewport = page.getViewport({ scale })

      // Create canvas
      const canvas = createCanvas(viewport.width, viewport.height)
      const context = canvas.getContext('2d')

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context as any,
        viewport: viewport,
      }

      await page.render(renderContext).promise

      // Convert canvas to buffer
      const buffer = canvas.toBuffer('image/png')

      // Upload to Cloudinary
      const imageUrl = await uploadToCloudinary(buffer, {
        folder: 'flipbookly/pages',
        resource_type: 'image',
        public_id: `page-${pageNum}-${Date.now()}`,
      })

      pageImageUrls.push(imageUrl)
    }

    return {
      pageImageUrls,
      detectedOrientation: detectedOrientation || finalOrientation || null
    }
  } catch (error) {
    console.error('Error converting PDF to images:', error)
    throw error
  }
}

// Helper function to detect PDF orientation
export async function detectPDFOrientation(pdfUrl: string): Promise<'portrait' | 'landscape' | null> {
  try {
    // Disable worker before loading pdfjs-dist
    if (typeof global !== 'undefined') {
      (global as any).pdfjsWorker = null
    }
    
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')
    // Disable worker in Node.js environment
    pdfjsLib.GlobalWorkerOptions.workerSrc = ''

    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    if (pdf.numPages === 0) {
      return null
    }

    const firstPage = await pdf.getPage(1)
    const viewport = firstPage.getViewport({ scale: 1.0 })

    return viewport.width > viewport.height ? 'landscape' : 'portrait'
  } catch (error) {
    console.error('Error detecting PDF orientation:', error)
    return null
  }
}
