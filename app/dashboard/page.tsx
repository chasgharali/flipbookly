'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PDFUploader from '@/components/PDFUploader'

interface Flipbook {
  id: string
  slug: string
  title: string | null
  createdAt: string
  pages: string[]
}

interface User {
  id: string
  email: string
  name?: string | null
}

export default function Dashboard() {
  const [flipbooks, setFlipbooks] = useState<Flipbook[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (data.success && data.user) {
        setUser(data.user)
        fetchFlipbooks(data.user.id)
      } else {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        router.push('/login')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userId')
      router.push('/login')
    }
  }

  const fetchFlipbooks = async (userId?: string) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/books', {
        headers: token ? {
          Authorization: `Bearer ${token}`,
        } : {},
      })
      const data = await res.json()
      setFlipbooks(data.flipbooks || [])
    } catch (error) {
      console.error('Error fetching flipbooks:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/book/${slug}`
    navigator.clipboard.writeText(url)
    // Better UX than alert
    const button = document.querySelector(`[data-slug="${slug}"]`)
    if (button) {
      const originalText = button.textContent
      button.textContent = 'Copied!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    }
  }

  const deleteFlipbook = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this flipbook?')) {
      return
    }

    setDeleting(slug)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/books/${slug}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) {
        throw new Error('Failed to delete flipbook')
      }

      setFlipbooks(flipbooks.filter((f) => f.slug !== slug))
    } catch (error) {
      console.error('Error deleting flipbook:', error)
      alert('Failed to delete flipbook. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-gray-200/60 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              FlipBookly
            </Link>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {user.email.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user.name || user.email.split('@')[0]}! 👋
          </h1>
          <p className="text-lg text-gray-600">Manage and create your PDF flipbooks</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Flipbooks</p>
                <p className="text-3xl font-bold">{flipbooks.length}</p>
              </div>
              <div className="text-4xl opacity-80">📚</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Pages</p>
                <p className="text-3xl font-bold">
                  {flipbooks.reduce((sum, f) => sum + f.pages.length, 0)}
                </p>
              </div>
              <div className="text-4xl opacity-80">📄</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">This Month</p>
                <p className="text-3xl font-bold">
                  {flipbooks.filter(f => {
                    const created = new Date(f.createdAt)
                    const now = new Date()
                    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()
                  }).length}
                </p>
              </div>
              <div className="text-4xl opacity-80">✨</div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="mb-10">
          <PDFUploader />
        </div>

        {/* Flipbooks List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Your Flipbooks
            </h2>
            <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              {flipbooks.length} {flipbooks.length === 1 ? 'flipbook' : 'flipbooks'}
            </span>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading your flipbooks...</p>
            </div>
          ) : flipbooks.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
              <div className="text-7xl mb-6">📚</div>
              <p className="text-2xl font-bold text-gray-800 mb-2">
                No flipbooks yet
              </p>
              <p className="text-gray-500 mb-6">
                Upload your first PDF to get started!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flipbooks.map((flipbook) => (
                <div
                  key={flipbook.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Card Header with Gradient */}
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 line-clamp-2">
                      {flipbook.title || 'Untitled Flipbook'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-blue-100">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(flipbook.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {flipbook.pages.length} pages
                      </span>
                    </div>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6">
                    <div className="flex flex-col gap-3">
                      <Link
                        href={`/book/${flipbook.slug}`}
                        className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/50 transition-all transform hover:scale-105 text-center text-sm font-bold"
                      >
                        📖 View Flipbook
                      </Link>
                      <div className="flex gap-2">
                        <button
                          data-slug={flipbook.slug}
                          onClick={() => copyLink(flipbook.slug)}
                          className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 hover:shadow-md transition-all text-sm font-semibold flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy Link
                        </button>
                        <button
                          onClick={() => deleteFlipbook(flipbook.slug)}
                          disabled={deleting === flipbook.slug}
                          className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-md transition-all text-sm font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          {deleting === flipbook.slug ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

