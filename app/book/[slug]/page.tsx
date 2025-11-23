import { notFound } from 'next/navigation'
import FlipbookViewer from '@/components/FlipbookViewer'

async function getFlipbook(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/books/${slug}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const data = await res.json()
    return data.flipbook
  } catch (error) {
    console.error('Error fetching flipbook:', error)
    return null
  }
}

export default async function BookPage({
  params,
}: {
  params: { slug: string }
}) {
  const flipbook = await getFlipbook(params.slug)

  if (!flipbook) {
    notFound()
  }

  return (
    <div>
      <FlipbookViewer 
        pages={flipbook.pages} 
        title={flipbook.title || undefined}
        orientation={flipbook.orientation || undefined}
      />
    </div>
  )
}

