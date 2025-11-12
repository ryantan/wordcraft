export interface ShareableWordList {
  name: string;
  description?: string;
  words: string[];
}

export function encodeWordListToUrl(wordList: ShareableWordList): string {
  const data = {
    n: wordList.name,
    d: wordList.description || '',
    w: wordList.words,
  };
  
  const encoded = btoa(JSON.stringify(data));
  return encoded;
}

export function decodeWordListFromUrl(encoded: string): ShareableWordList | null {
  try {
    const decoded = atob(encoded);
    const data = JSON.parse(decoded);
    
    if (!data.n || !Array.isArray(data.w) || data.w.length === 0) {
      return null;
    }
    
    return {
      name: data.n,
      description: data.d || undefined,
      words: data.w,
    };
  } catch (error) {
    console.error('Failed to decode word list from URL:', error);
    return null;
  }
}

export function createShareUrl(wordList: ShareableWordList, baseUrl: string): string {
  const encoded = encodeWordListToUrl(wordList);
  return `${baseUrl}/share?data=${encodeURIComponent(encoded)}`;
}