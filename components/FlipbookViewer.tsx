'use client'

import { useState, useEffect, useRef } from 'react'
import HTMLFlipBook from 'react-pageflip'
import Image from 'next/image'

interface FlipbookViewerProps {
  pages: string[]
  title?: string
  orientation?: 'portrait' | 'landscape' | null
}

export default function FlipbookViewer({ pages, title, orientation }: FlipbookViewerProps) {
  const [currentPage, setCurrentPage] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(true) // Start in fullscreen
  const [zoom, setZoom] = useState(1)
  const [showControls, setShowControls] = useState(false)
  // usePortrait=true means single page, usePortrait=false means two-page spread
  // When orientation is 'portrait', we want single page view (usePortrait=true)
  // When orientation is 'landscape', we want two-page spread (usePortrait=false)
  const [usePortrait, setUsePortrait] = useState<boolean>(
    orientation === 'portrait' ? true : orientation === 'landscape' ? false : true
  )
  const flipBookRef = useRef<any>(null)

  const totalPages = pages.length

  const handlePageChange = (e: any) => {
    setCurrentPage(e.data)
  }

  const goToPrevPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipPrev()
    }
  }

  const goToNextPage = () => {
    if (flipBookRef.current) {
      flipBookRef.current.pageFlip().flipNext()
    }
  }

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const element = document.documentElement
      if (element.requestFullscreen) {
        element.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
    setIsFullscreen(!isFullscreen)
  }

  useEffect(() => {
    // Enter fullscreen on mount
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (error) {
        console.log('Fullscreen not available:', error)
      }
    }
    enterFullscreen()

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Set orientation based on prop - if provided, use it directly
  useEffect(() => {
    if (orientation === 'portrait') {
      setUsePortrait(true) // Single page view
    } else if (orientation === 'landscape') {
      setUsePortrait(false) // Two-page spread view  
    } else {
      // Default to single page if not specified
      setUsePortrait(true)
    }
  }, [orientation])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 2))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
  }

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setShowControls(false)
      }, 3000) // Hide after 3 seconds of inactivity
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearTimeout(timeoutId)
    }
  }, [])

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
      {/* Floating Controls Panel - Show on mouse movement, hide after inactivity */}
      <div 
        className={`absolute top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl px-5 py-3 border border-white/20">
          {title && (
            <h1 className="text-lg font-bold mr-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {title}
            </h1>
          )}
          
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none text-sm font-semibold"
          >
            ← Prev
          </button>

          <span className="text-gray-700 font-semibold text-sm whitespace-nowrap px-3 py-2 bg-gray-100 rounded-lg">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 disabled:transform-none text-sm font-semibold"
          >
            Next →
          </button>

          <div className="border-l border-gray-300 pl-3 flex gap-2 items-center">
            <button
              onClick={handleZoomOut}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all text-sm font-medium"
            >
              −
            </button>
            <span className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-semibold min-w-[50px] text-center border border-gray-200">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all text-sm font-medium"
            >
              +
            </button>
          </div>

          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 hover:shadow-md transition-all text-sm font-medium"
          >
            {isFullscreen ? 'Exit' : 'Full'}
          </button>
        </div>
      </div>

      {/* Flipbook - Centered with proper constraints */}
      <div className="w-full h-full flex items-center justify-center p-4">
        <div
          className="shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
            transition: 'transform 0.3s ease',
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
        <HTMLFlipBook
          ref={flipBookRef}
          width={usePortrait ? 800 : 1600}
          height={usePortrait ? 1000 : 800}
          minWidth={usePortrait ? 400 : 800}
          maxWidth={usePortrait ? 1200 : 1800}
          minHeight={usePortrait ? 500 : 600}
          maxHeight={usePortrait ? 1600 : 1200}
          size="stretch"
          usePortrait={usePortrait}
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          onFlip={handlePageChange}
          className="flipbook"
          style={{ 
            width: 'auto', 
            height: 'auto',
            maxWidth: '95vw',
            maxHeight: '95vh'
          }}
        >
          {pages.map((page, index) => (
            <div
              key={index}
              className="page bg-white"
              data-density={index === 0 || index === pages.length - 1 ? 'hard' : 'soft'}
            >
              <div className="page-content">
                <Image
                  src={page}
                  alt={`Page ${index + 1}`}
                  width={800}
                  height={1000}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>
          ))}
        </HTMLFlipBook>
        </div>
      </div>

      <style jsx global>{`
        .flipbook {
          width: auto !important;
          height: auto !important;
          max-width: 95vw !important;
          max-height: 95vh !important;
        }
        .flipbook .page {
          background-color: white;
          border: 1px solid #ccc;
          width: 100%;
          height: 100%;
        }
        .flipbook .page-content {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .flipbook .page-content img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
        .stf-parent {
          width: auto !important;
          height: auto !important;
          max-width: 95vw !important;
          max-height: 95vh !important;
        }
        body {
          overflow: hidden;
          margin: 0;
          padding: 0;
        }
        html {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  )
}

