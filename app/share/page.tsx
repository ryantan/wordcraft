'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { decodeWordListFromUrl } from '@/lib/share/urlEncoder';
import { createWordList, wordListNameExists } from '@/lib/storage/localStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SharePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [wordListId, setWordListId] = useState<string>('');

  useEffect(() => {
    const importWordList = async () => {
      const data = searchParams.get('data');
      
      if (!data) {
        setStatus('error');
        setErrorMessage('No word list data found in URL');
        return;
      }

      const decodedWordList = decodeWordListFromUrl(data);
      
      if (!decodedWordList) {
        setStatus('error');
        setErrorMessage('Invalid word list data');
        return;
      }

      try {
        let finalName = decodedWordList.name;
        let counter = 1;
        
        while (wordListNameExists(finalName)) {
          finalName = `${decodedWordList.name} (${counter})`;
          counter++;
        }

        const newWordList = await createWordList({
          name: finalName,
          description: decodedWordList.description,
          words: decodedWordList.words,
        });

        setWordListId(newWordList.id);
        setStatus('success');

        setTimeout(() => {
          router.push(`/story?listId=${newWordList.id}`);
        }, 1500);
      } catch (error) {
        setStatus('error');
        setErrorMessage('Failed to save word list');
        console.error('Error saving word list:', error);
      }
    };

    importWordList();
  }, [searchParams, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Saving the wordlist and starting the game</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-8 w-8 border-4 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Import Failed</CardTitle>
            <CardDescription>{errorMessage}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => router.push('/word-lists')}>Go to Word Lists</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Starting the game...</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button onClick={() => router.push(`/story?listId=${wordListId}`)}>
            Start Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}