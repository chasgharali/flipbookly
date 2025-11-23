import Link from 'next/link'
import PDFUploader from '@/components/PDFUploader'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FlipBookly
            </h1>
            <div className="flex gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm text-gray-700 hover:text-gray-900 transition-colors font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 font-semibold"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 max-w-3xl mx-auto">
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Transform PDFs into Interactive Flipbooks
          </h2>
          <p className="text-xl text-gray-600 mb-8 font-light">
            Upload your PDF and get a beautiful, shareable flipbook in seconds
          </p>
        </div>

        {/* Upload Section */}
        <div className="flex justify-center mb-20">
          <PDFUploader />
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-4">📄</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Easy Upload
            </h3>
            <p className="text-gray-600">
              Simply upload your PDF file and let us handle the rest
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Beautiful Viewer
            </h3>
            <p className="text-gray-600">
              Experience your documents with smooth page-turning animations
            </p>
          </div>

          <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-gray-200/50 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">
              Shareable Links
            </h3>
            <p className="text-gray-600">
              Get a unique link to share your flipbook with anyone
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200/50 mt-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-gray-500 text-sm">
            © 2024 FlipBookly. Made with ❤️
          </p>
        </div>
      </footer>
    </div>
  )
}

