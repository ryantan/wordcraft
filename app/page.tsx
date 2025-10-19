import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-primary-600">
          WordCraft
        </h1>

        <p className="text-xl text-gray-600">
          Adaptive Spelling Game for Children Ages 5-10
        </p>

        <div className="flex gap-4 justify-center mt-8">
          <Link href="/word-lists">
            <button className="btn-primary btn-lg">
              Get Started
            </button>
          </Link>
          <Link href="/word-lists">
            <button className="btn-secondary btn-lg">
              Manage Word Lists
            </button>
          </Link>
        </div>

        <div className="mt-12 p-6 bg-success-50 rounded-xl border border-success-200">
          <p className="text-sm text-success-800">
            ✅ <strong>Epic 2 Complete</strong> - Word List Management Ready!
          </p>
        </div>

        <div className="mt-6 text-left space-y-3">
          <h3 className="font-semibold text-gray-900">What&apos;s Working:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Create and edit word lists</li>
            <li>Add up to 100 words per list</li>
            <li>Input validation and duplicate detection</li>
            <li>Data persists in browser storage</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
