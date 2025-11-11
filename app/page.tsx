import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-bold text-primary-600">WordCraft</h1>

        <p className="text-xl text-gray-600">Adaptive Spelling Game for Children Ages 5-10</p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link href="/word-lists">
            <button className="btn-primary btn-lg">Get Started</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
