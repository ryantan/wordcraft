'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WordListForm } from '@/components/word-lists/WordListForm'
import { createWordList } from '@/lib/storage/localStorage'
import type { WordListCreateInput } from '@/types'

export default function NewWordListPage() {
  const router = useRouter()

  const handleSubmit = (data: WordListCreateInput) => {
    try {
      createWordList(data)
      router.push('/word-lists')
    } catch (error) {
      console.error('Failed to create word list:', error)
      alert('Failed to create word list. Please try again.')
    }
  }

  return (
    <main className="container mx-auto p-8 max-w-3xl">
      <div className="mb-6">
        <Link
          href="/word-lists"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 mr-1"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Word Lists
        </Link>
      </div>

      <WordListForm
        onSubmit={handleSubmit}
        onCancel={() => router.push('/word-lists')}
        submitLabel="Create Word List"
      />
    </main>
  )
}
