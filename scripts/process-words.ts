import fs from 'fs/promises';
import path from 'path';

import { words } from '@/lib/data/words';
import { generateWordsWithConjugates } from '@/lib/data/wordsWithConjugation';

async function run() {
  const outputPath = path.join(process.cwd(), 'data', 'words-with-conjugates.json');

  try {
    const wordsWithConjugates = generateWordsWithConjugates(words);

    // Ensure the data directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Write wordsWithConjugates as json to a file
    await fs.writeFile(outputPath, JSON.stringify(wordsWithConjugates, null, 2), 'utf-8');

    console.log(`Successfully wrote ${wordsWithConjugates.length} words to ${outputPath}`);
  } catch (error) {
    console.error('Error writing words to file:', error);
    process.exit(1);
  }
}

run();
