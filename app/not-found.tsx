import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 text-gray-800 dark:text-white">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-300">
          Flipbook Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The flipbook you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

