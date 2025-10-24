import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface CsvRow {
  word: string;
  level: string;
  pos: string;
  definition_url: string;
  voice_url: string;
}

async function findMissingWords() {
  try {
    // Read words-with-conjugates.json
    const conjugatesPath = path.join(__dirname, '../data/words-with-conjugates.json');
    const conjugatesData = JSON.parse(fs.readFileSync(conjugatesPath, 'utf-8'));
    const existingWords = new Set<string>(conjugatesData);

    // Read and parse CSV
    const csvPath = path.join(__dirname, '../data/oxford-5k.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true
    }) as CsvRow[];

    // Extract unique words from CSV that are not in conjugates
    const csvWordsSet = new Set<string>();
    const missingWords = new Set<string>();

    records.forEach(record => {
      const word = record.word.trim();
      if (word) {
        csvWordsSet.add(word);
        if (!existingWords.has(word)) {
          missingWords.add(word);
        }
      }
    });

    // Convert to sorted array
    const missingWordsArray = Array.from(missingWords).sort();

    // Save to file
    const outputPath = path.join(__dirname, '../data/words-not-in-conjugates.json');
    fs.writeFileSync(outputPath, JSON.stringify(missingWordsArray, null, 2));

    // Output summary
    console.log(`Total unique words in CSV: ${csvWordsSet.size}`);
    console.log(`Unique words not in words-with-conjugates.json: ${missingWordsArray.length}`);
    console.log(`\nResults saved to: ${outputPath}`);

    // Optional: Display first 10 missing words as sample
    console.log('\nFirst 10 missing words:');
    missingWordsArray.slice(0, 10).forEach(word => {
      console.log(`  - ${word}`);
    });

  } catch (error) {
    console.error('Error processing files:', error);
    process.exit(1);
  }
}

findMissingWords();