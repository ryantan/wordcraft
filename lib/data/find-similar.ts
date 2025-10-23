// import { words } from '@/lib/data/words';
import { wordsWithConjugates as words } from '@/lib/data/wordsWithConjugation';
import sortBy from 'lodash/sortBy';
import { DamerauLevenshteinDistance, DoubleMetaphone } from 'natural';

// const metaphone = new natural.Metaphone();
const metaphone = new DoubleMetaphone();
// const soundEx = new natural.SoundEx();

const lastX = (s: string, x: number): string =>
  s.length > x ? s.substring(s.length - x, s.length) : s;
const last1 = (s: string): string => lastX(s, 1);
const last2 = (s: string): string => lastX(s, 2);
const last3 = (s: string): string => lastX(s, 3);
const last4 = (s: string): string => lastX(s, 4);

// Sort distance2 to prioritize words that start with same letter or end with same 3 letters.
const sortByFirstLastSimilarity = (original: string, list: string[]): string[] => {
  const scoring = new Map<string, number>();
  const first1Original = original.substring(0, 1);
  const first2Original = original.substring(0, 2);
  const last1Original = last1(original);
  const last2Original = last2(original);
  const last3Original = last3(original);
  const last4Original = last4(original);
  for (const item of list) {
    let score = 0;
    if (item.substring(0, 1) === first1Original) {
      score += 2;
    }
    if (item.substring(0, 2) === first2Original) {
      score += 3;
    }
    if (last1(item) === last1Original) {
      score++;
    }
    if (last2(item) === last2Original) {
      score++;
    }
    if (last3(item) === last3Original) {
      score += 2;
    }
    if (last4(item) === last4Original) {
      score += 3;
    }
    scoring.set(item, 1 - score);
  }
  const sorted = sortBy([...scoring.entries()], ([_, score]) => score);
  return sorted.map(([item]) => item);
};

export const findSimilar = async (word: string) => {
  // Loop through all words and calc levenshtein distance.
  const distance1SoundAlike: string[] = [];
  const distance1: string[] = [];
  const distance1SoundAlike2: string[] = [];
  const distance2SoundAlike: string[] = [];
  let distance2: string[] = [];
  const distance2SoundAlike2: string[] = [];
  const distance3SoundAlike: string[] = [];
  const distance3: string[] = [];
  const distance3SoundAlike2: string[] = [];
  const farButSoundAlike: string[] = [];
  const farButSoundAlike2: string[] = [];
  let timeOnDistance = 0;
  let timeOnSound = 0;

  // const encodingOriginal = metaphone.process(word);
  // const encodingOriginalLast2A = last2(encodingOriginal[0]);
  // const encodingOriginalLast2B = last2(encodingOriginal[1]);
  // const originalLast3Char = last3(word);

  if (word.indexOf(' ') !== -1) {
    // This is a multi-word, ignore.
    return [];
  }

  words.forEach(w => {
    if (w === word) {
      return;
    }
    // Skip `gold` if the word is `golden` to prevent genuine confusion.
    if (word.indexOf(w) !== -1) {
      return;
    }
    // Avoid short words from getting a very short word, e.g. `water` with
    // `war`, `sofa` with `off`
    if (word.length <= 5 && w.length <= word.length - 1) {
      return;
    }
    if (w.length < word.length - 1) {
      return;
    }
    let start = Date.now();

    // metaphone seems to give closer matches
    // const soundsAlike = soundEx.compare(word, w);
    const soundsAlike = metaphone.compare(word, w);
    // if (soundsAlike) {
    //   const encoding = metaphone.process(w);
    //   if (!encodingOriginal[0].startsWith(encoding[0].slice(0, 1))) {
    //     console.log(`Metaphone says ${w} (${encoding}) is alike ${word} (${encodingOriginal})`);
    //     console.log(`But they do not start with same phonic, so we ignore it.`);
    //     soundsAlike = false;
    //   } else if (!encodingOriginal[0].endsWith(last2(encoding[0]))) {
    //     console.log(`Metaphone says ${w} (${encoding}) is alike ${word} (${encodingOriginal})`);
    //     console.log(`But they do not end with same 2 phonic, so we ignore it.`);
    //     soundsAlike = false;
    //   }
    // }

    const soundsAlike2 = false;
    // let soundsAlike2 = soundsAlike;
    // if (!soundsAlike2) {
    //   // region Approach 1: use last 2 characters to compare phonic encodings.
    //   // const encoding = metaphone.process(w);
    //   // console.log(`Metaphone says ${w} (${encoding}) is NOT alike ${word} (${encodingOriginal})`);
    //   // const encodingLast2A = last2(encoding[0]);
    //   // const encodingLast2B = last2(encoding[1]);
    //   // const last3Char = last3(w);
    //   // if (last3Char === originalLast3Char) {
    //   //   console.log(
    //   //     `Marking ${w} (${encoding}) as alike ${word} as last 3 char match: ${last3Char} === ${originalLast3Char}`,
    //   //   );
    //   //   soundsAlike2 = true;
    //   // } else {
    //   //   // Check if ending 2 characters in encoding is the same.
    //   //   if (encodingLast2A === encodingOriginalLast2A) {
    //   //     console.log(
    //   //       `Marking ${w} (${encoding}) as alike ${word} as ${encodingLast2A} === ${encodingOriginalLast2A}`,
    //   //     );
    //   //     soundsAlike2 = true;
    //   //   } else if (encodingLast2A === encodingOriginalLast2B) {
    //   //     console.log(
    //   //       `Marking ${w} (${encoding}) as alike ${word} as ${encodingLast2A} === ${encodingOriginalLast2B}`,
    //   //     );
    //   //     soundsAlike2 = true;
    //   //   } else if (encodingLast2B === encodingOriginalLast2A) {
    //   //     console.log(
    //   //       `Marking ${w} (${encoding}) as alike ${word} as ${encodingLast2B} === ${encodingOriginalLast2A}`,
    //   //     );
    //   //     soundsAlike2 = true;
    //   //   } else if (encodingLast2B === encodingOriginalLast2B) {
    //   //     console.log(
    //   //       `Marking ${w} (${encoding}) as alike ${word} as ${encodingLast2B} === ${encodingOriginalLast2B}`,
    //   //     );
    //   //     soundsAlike2 = true;
    //   //   }
    //   // }
    //   // endregion
    //   // region Approach 2: use Damerau Levenshtein distance to compare phonic encodings.
    //   // const encoding = metaphone.process(w);
    //   // const distanceOfEncoding = natural.DamerauLevenshteinDistance(
    //   //   encoding[0],
    //   //   encodingOriginal[0],
    //   // );
    //   // if (distanceOfEncoding < 2 && encoding[0].length === encodingOriginal[0].length) {
    //   //   console.log(`Metaphone says ${w} (${encoding}) is NOT alike ${word} (${encodingOriginal})`);
    //   //   console.log(
    //   //     `But we mark ${w} (${encoding}) as alike ${word} (${encodingOriginal}) as distanceOfEncoding=${distanceOfEncoding}`,
    //   //   );
    //   //   soundsAlike2 = true;
    //   // }
    //   // endregion
    // }

    let timeTaken = Date.now() - start;
    timeOnSound += timeTaken;

    start = Date.now();
    // This does not consider transpositions as cost (import levenshtein from 'fast-levenshtein';)
    // const distance = levenshtein.get(word, w);
    // This considers transpositions as cost 1
    const distance = DamerauLevenshteinDistance(word, w);
    timeTaken = Date.now() - start;
    timeOnDistance += timeTaken;

    if (distance === 1) {
      if (soundsAlike) {
        distance1SoundAlike.push(w);
      } else if (soundsAlike2) {
        distance1SoundAlike2.push(w);
      } else {
        distance1.push(w);
      }
    } else if (distance === 2) {
      if (soundsAlike) {
        distance2SoundAlike.push(w);
      } else if (soundsAlike2) {
        distance2SoundAlike2.push(w);
      } else {
        distance2.push(w);
      }
    } else if (distance === 3) {
      if (soundsAlike) {
        distance3SoundAlike.push(w);
      } else if (soundsAlike2) {
        distance3SoundAlike2.push(w);
      } else {
        // distance3.push(w);
      }
    } else {
      // console.log(`distance: ${distance}`);
      if (soundsAlike) {
        farButSoundAlike.push(w);
      } else if (soundsAlike2) {
        farButSoundAlike2.push(w);
      }
    }

    // // Early termination.
    // // Note: this might miss out on better fits.
    // const foundSoFar = distance1SoundAlike.length + distance2SoundAlike.length;
    // if (foundSoFar > 4) {
    //   return;
    // }
  });

  // Sort distance2 to prioritize words that start with same letter or end with same 3 letters.
  distance2 = sortByFirstLastSimilarity(word, distance2);

  console.log({
    word,
    timeOnSound,
    timeOnDistance,
    distance1SoundAlike,
    distance1,
    distance1SoundAlike2,
    distance2SoundAlike,
    distance2,
    distance2SoundAlike2,
    distance3SoundAlike,
    distance3,
    distance3SoundAlike2,
    farButSoundAlike,
    farButSoundAlike2,
  });

  const candidates = [
    ...distance1SoundAlike,
    ...distance1,
    ...distance1SoundAlike2,
    ...distance2SoundAlike,
    ...distance2,
    ...distance2SoundAlike2,
    ...distance3SoundAlike,
    ...distance3,
    ...distance3SoundAlike2,
    ...farButSoundAlike,
    ...farButSoundAlike2,
  ].slice(0, 4);

  // console.log(`encodingOriginal ${word}:`, encodingOriginal);
  // for (const candidate of candidates) {
  //   const encoding = metaphone.process(candidate);
  //   console.log(`encoding for ${candidate}:`, encoding);
  // }

  return candidates;
};

// export const findSimilar2 = (word: string) => {
//   // Loop through all words and compare how they sound.
//
//   const found: string[] = [];
//   words.forEach(w => {
//     if (w === word) {
//       return;
//     }
//     if (!metaphone.compare(word, w)) {
//       return;
//     }
//     found.push(w);
//   });
//   return found;
// };
