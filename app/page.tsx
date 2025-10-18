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
          <button className="btn-primary btn-lg">
            Get Started
          </button>
          <button className="btn-secondary btn-lg">
            Learn More
          </button>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            🚧 <strong>Under Construction</strong> - Foundation & Project Setup in Progress
          </p>
        </div>
      </div>
    </main>
  )
}
