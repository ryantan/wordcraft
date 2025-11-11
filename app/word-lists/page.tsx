'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { WordListCard } from '@/components/word-lists/WordListCard'
import { getAllWordLists, deleteWordList } from '@/lib/storage/localStorage'
import type { WordList } from '@/types'

export default function WordListsPage() {
  const router = useRouter()
  const [wordLists, setWordLists] = useState<WordList[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWordLists()
  }, [])

  const loadWordLists = () => {
    setIsLoading(true)
    const lists = getAllWordLists()
    
    // Auto-redirect to new word list form if no lists exist
    if (lists.length === 0) {
      router.push('/word-lists/new')
      return
    }
    
    setWordLists(lists)
    setIsLoading(false)
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this word list?')) {
      return
    }

    const success = deleteWordList(id)
    if (success) {
      loadWordLists()
    }
  }

  if (isLoading) {
    return (
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-600">Loading word lists...</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold mb-2">Word Lists</h1>
          <p className="text-gray-600">Manage your spelling word collections</p>
        </div>
        <Link href="/word-lists/new">
          <Button size="lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create New List
          </Button>
        </Link>
      </div>

      {wordLists.length === 0 ? (
        <div className="text-center py-16">
          <div className="mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-16 h-16 mx-auto text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No word lists yet</h2>
          <p className="text-gray-600 mb-6">Create your first word list to get started!</p>
          <Link href="/word-lists/new">
            <Button size="lg">Create Your First List</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wordLists.map(list => (
            <WordListCard key={list.id} wordList={list} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </main>
  )
}
