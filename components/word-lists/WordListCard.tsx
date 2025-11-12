'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { WordList } from '@/types';
import Link from 'next/link';
import { type FC, useState } from 'react';
import { createShareUrl } from '@/lib/share/urlEncoder';

interface WordListCardProps {
  wordList: WordList;
  onDelete?: (id: string) => void;
}

export const WordListCard: FC<WordListCardProps> = ({ wordList, onDelete }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(wordList.updatedAt);

  const handleShare = async () => {
    setIsSharing(true);
    setShareMessage('');
    try {
      const baseUrl = window.location.origin;
      const shareUrl = createShareUrl({
        name: wordList.name,
        description: wordList.description,
        words: wordList.words,
      }, baseUrl);
      
      await navigator.clipboard.writeText(shareUrl);
      setShareMessage('Link copied!');
      setTimeout(() => setShareMessage(''), 3000);
    } catch (error) {
      console.error('Failed to copy share link:', error);
      setShareMessage('Failed to copy');
      setTimeout(() => setShareMessage(''), 3000);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="text-xl">{wordList.name}</CardTitle>
        {wordList.description && (
          <CardDescription className="truncate-2">{wordList.description}</CardDescription>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-semibold">{wordList.words.length}</span>
            <span>{wordList.words.length === 1 ? 'word' : 'words'}</span>
          </div>
          <div className="text-gray-400">•</div>
          <div>Updated {formattedDate}</div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 gap-y-2 flex-wrap">
        <Link href={`/story?listId=${wordList.id}`} className="w-full">
          {/*<Button*/}
          {/*  variant="outline"*/}
          {/*  className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"*/}
          {/*>*/}
          {/*  🚀 Play with story*/}
          {/*</Button>*/}
          <Button className="w-full">🚀 Play with story</Button>
        </Link>
        <Link href={`/game?listId=${wordList.id}`} className="w-full">
          {/*<Button className="w-full">Play without story</Button>*/}
          <Button
            variant="outline"
            className="w-full bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            Play without story
          </Button>
        </Link>
        <div className="flex gap-2 w-full">
          <Link href={`/word-lists/${wordList.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Edit
            </Button>
          </Link>
          <div className="relative">
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={isSharing}
              aria-label="Share word list"
              title="Share word list"
            >
              {isSharing ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              ) : shareMessage ? (
                <span className="text-xs">{shareMessage}</span>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
                  />
                </svg>
              )}
            </Button>
          </div>
          {onDelete && (
            <Button
              variant="destructive"
              size="icon"
              onClick={() => onDelete(wordList.id)}
              aria-label="Delete word list"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                />
              </svg>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
