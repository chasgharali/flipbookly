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

// Helper function to safely load pdfjs-dist without worker
function loadPdfJs(): any {
  const Module = require('module')
  const originalResolve = Module._resolveFilename
  const path = require('path')

  // Intercept module resolution to prevent worker file lookup
  Module._resolveFilename = function (request: string, parent: any, isMain: boolean, options: any) {
    // Check if this is a worker-related request
    // Handle both direct requests and relative paths from pdfjs-dist
    const isWorkerRequest =
      request.includes('pdf.worker') ||
      request.endsWith('pdf.worker.js') ||
      request === './pdf.worker.js' ||
      request === 'pdf.worker.js' ||
      // Check if parent is from pdfjs-dist and request is a relative worker path
      (parent && parent.filename &&
        parent.filename.includes('pdfjs-dist') &&
        (request === './pdf.worker.js' || request.includes('worker')))

    if (isWorkerRequest) {
      // Return path to our stub worker file
      try {
        return path.resolve(__dirname, 'pdf.worker.stub.js')
      } catch {
        // Fallback - try to resolve the stub
        const stubPath = path.join(__dirname, 'pdf.worker.stub.js')
        return stubPath
      }
    }

    try {
      return originalResolve.apply(this, arguments as any)
    } catch (error: any) {
      // If resolution fails and it's a worker-related error, return a stub path
      if (error.message && error.message.includes('pdf.worker')) {
        return path.resolve(__dirname, 'pdf.worker.stub.js')
      }
      throw error
    }
  }

  try {
    // Set environment variable
    process.env.PDFJS_DISABLE_WORKER = '1'

    // Load pdfjs-dist
    const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

    // Disable worker completely - set before any operations
    if (pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = ''
      pdfjsLib.GlobalWorkerOptions.workerPort = null
      // Also try to disable worker initialization
      if (typeof pdfjsLib.GlobalWorkerOptions.setWorkerSrc === 'function') {
        pdfjsLib.GlobalWorkerOptions.setWorkerSrc('')
      }
    }

    return pdfjsLib
  } catch (error: any) {
    // If loading fails due to worker, provide a helpful error
    if (error.message && error.message.includes('pdf.worker')) {
      throw new Error('Failed to load pdfjs-dist: Worker file resolution failed. This is a known issue in serverless environments.')
    }
    throw error
  } finally {
    // Restore original function
    Module._resolveFilename = originalResolve
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
    // Load pdfjs-dist with worker disabled using our helper
    const pdfjsLib = loadPdfJs()

    // Fetch the PDF
    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()

    // Load PDF with worker disabled explicitly
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
      disableAutoFetch: true,
      disableStream: true,
    }).promise

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
    // Load pdfjs-dist with worker disabled using our helper
    const pdfjsLib = loadPdfJs()

    const response = await fetch(pdfUrl)
    const arrayBuffer = await response.arrayBuffer()

    // Load PDF with worker disabled explicitly
    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: false,
      disableAutoFetch: true,
      disableStream: true,
    }).promise

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
