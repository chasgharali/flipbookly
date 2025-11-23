'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

export default function PDFUploader() {
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [title, setTitle] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [detectedOrientation, setDetectedOrientation] = useState<'portrait' | 'landscape' | null>(null)
  const [selectedOrientation, setSelectedOrientation] = useState<'portrait' | 'landscape' | null>(null)
  const [showOrientationChoice, setShowOrientationChoice] = useState(false)
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Please select a PDF file')
      return
    }

    // Validate file size (100MB)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      alert('File size exceeds 100MB limit')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Get upload signature from API
      const signatureResponse = await fetch('/api/upload/signature')
      if (!signatureResponse.ok) {
        throw new Error('Failed to get upload signature')
      }
      const signatureData = await signatureResponse.json()

      // Upload directly to Cloudinary (bypasses Vercel body size limit)
      const cloudinaryFormData = new FormData()
      cloudinaryFormData.append('file', file)
      cloudinaryFormData.append('api_key', signatureData.apiKey)
      cloudinaryFormData.append('timestamp', signatureData.timestamp.toString())
      cloudinaryFormData.append('signature', signatureData.signature)
      cloudinaryFormData.append('folder', signatureData.folder)
      cloudinaryFormData.append('resource_type', signatureData.resourceType)

      // Upload with progress tracking
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100
          setUploadProgress(Math.round(percentComplete))
        }
      })

      const uploadPromise = new Promise<string>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            try {
              const response = JSON.parse(xhr.responseText)
              if (response.secure_url) {
                resolve(response.secure_url)
              } else {
                reject(new Error('Upload failed: No URL returned'))
              }
            } catch (error) {
              reject(new Error('Failed to parse upload response'))
            }
          } else {
            try {
              const error = JSON.parse(xhr.responseText)
              reject(new Error(error.error?.message || 'Upload failed'))
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}`))
            }
          }
        })

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed: Network error'))
        })

        xhr.open('POST', `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/raw/upload`)
        xhr.send(cloudinaryFormData)
      })

      const pdfUrl = await uploadPromise

      setUploading(false)
      setUploadProgress(100)
      setUploadedPdfUrl(pdfUrl)

      // Detect orientation
      const detectResponse = await fetch('/api/detect-orientation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfUrl: pdfUrl,
        }),
      })

      if (detectResponse.ok) {
        const detectData = await detectResponse.json()
        setDetectedOrientation(detectData.orientation)
        setSelectedOrientation(detectData.orientation)
        // Always show orientation choice so user can override
        setShowOrientationChoice(true)
      } else {
        // If detection fails, show choice
        setShowOrientationChoice(true)
      }
    } catch (error) {
      console.error('Error uploading/processing PDF:', error)
      alert(error instanceof Error ? error.message : 'Failed to process PDF. Please try again.')
      setUploading(false)
      setProcessing(false)
      setUploadProgress(0)
      setShowOrientationChoice(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const processPDF = async (pdfUrl: string, orientation: 'portrait' | 'landscape' | null) => {
    setProcessing(true)
    setShowOrientationChoice(false)

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('token')
      const userId = localStorage.getItem('userId')

      // Process PDF and create flipbook
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          pdfUrl,
          title: title || 'Untitled Flipbook',
          orientation: orientation || undefined,
          userId: userId || undefined,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = 'Failed to process PDF'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (data.success && data.flipbook) {
        router.push(`/book/${data.flipbook.slug}`)
      } else {
        throw new Error(data.error || 'Failed to create flipbook')
      }
    } catch (error) {
      console.error('Error processing PDF:', error)
      alert(error instanceof Error ? error.message : 'Failed to process PDF. Please try again.')
      setProcessing(false)
      setShowOrientationChoice(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-200/50 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">
        Upload PDF
      </h2>

      <div className="mb-4">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Title (optional)
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter flipbook title"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={uploading || processing}
        />
      </div>

      <div className="mb-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileSelect}
          disabled={uploading || processing}
          className="hidden"
          id="pdf-upload"
        />
        <label
          htmlFor="pdf-upload"
          className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            uploading || processing
              ? 'border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 cursor-not-allowed'
              : 'border-gray-300 hover:border-blue-400 hover:shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 hover:from-blue-50 hover:to-indigo-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-10 h-10 mb-3 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PDF (MAX. 100MB)</p>
          </div>
        </label>
      </div>

      {uploading && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {showOrientationChoice && uploadedPdfUrl && (
        <div className="mb-4 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-sm">
          <p className="text-sm font-semibold text-gray-800 mb-3">
            {detectedOrientation 
              ? `📐 Detected: ${detectedOrientation === 'landscape' ? 'Landscape' : 'Portrait'} - Choose orientation:`
              : '📐 Choose PDF orientation:'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSelectedOrientation('portrait')
                processPDF(uploadedPdfUrl, 'portrait')
              }}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                selectedOrientation === 'portrait'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              📄 Portrait
            </button>
            <button
              onClick={() => {
                setSelectedOrientation('landscape')
                processPDF(uploadedPdfUrl, 'landscape')
              }}
              className={`flex-1 px-5 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${
                selectedOrientation === 'landscape'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              📄 Landscape
            </button>
          </div>
        </div>
      )}

      {processing && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-700">
            Processing PDF and converting pages...
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few moments
          </p>
        </div>
      )}
    </div>
  )
}

