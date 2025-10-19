'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { WordListForm } from '@/components/word-lists/WordListForm'
import { getWordList, updateWordList } from '@/lib/storage/localStorage'
import type { WordList, WordListCreateInput } from '@/types'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function EditWordListPage({ params }: PageProps) {
  const router = useRouter()
  const [wordList, setWordList] = useState<WordList | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [id, setId] = useState<string | null>(null)

  useEffect(() => {
    params.then(p => {
      setId(p.id)
      const list = getWordList(p.id)
      setWordList(list)
      setIsLoading(false)
    })
  }, [params])

  const handleSubmit = (data: WordListCreateInput) => {
    if (!id) return

    try {
      updateWordList(id, data)
      router.push('/word-lists')
    } catch (error) {
      console.error('Failed to update word list:', error)
      alert('Failed to update word list. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto p-8 max-w-3xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading word list...</p>
          </div>
        </div>
      </main>
    )
  }

  if (!wordList) {
    return (
      <main className="container mx-auto p-8 max-w-3xl">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Word List Not Found</h1>
          <p className="text-gray-600 mb-6">The word list you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/word-lists"
            className="inline-flex items-center text-primary-500 hover:text-primary-600"
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
      </main>
    )
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
        initialData={{
          name: wordList.name,
          description: wordList.description,
          words: wordList.words,
        }}
        onSubmit={handleSubmit}
        onCancel={() => router.push('/word-lists')}
        submitLabel="Update Word List"
      />
    </main>
  )
}
