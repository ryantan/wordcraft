import nlp from 'compromise';

import { words } from './words';

/**
 * Processes word list to all conjugated forms.
 */
export const wordsWithConjugates = words.flatMap(word => {
  const doc = nlp(word);
  const conjugatedVerbs = doc.verbs().conjugate()?.[0];
  if (!conjugatedVerbs) {
    return [word];
  }

  delete (conjugatedVerbs as any).FutureTense;
  // console.log('conjugatedVerbs:', conjugatedVerbs);

  let result = [word, ...Object.values(conjugatedVerbs)].filter(v => !!v);
  result = [...new Set(result)];
  // console.log('result:', result);

  return result;
});

// Not tested. Originally wanted to use this when finding similar words, decided to pre-process the words list instead.
//
// function matchTense(baseWord: string, targetWord: string): string {
//   const baseDoc = nlp(baseWord).verbs();
//   const targetDoc = nlp(targetWord).verbs();
//
//   if (!baseDoc.found || !targetDoc.found) {
//     return targetWord; // not verbs or unrecognized words
//   }
//
//   const baseTense = baseDoc.conjugation()[0];
//   const targetConjugations = targetDoc.conjugation()[0];
//
//   if (!baseTense || !targetConjugations) {
//     return targetWord;
//   }
//
//   let newWord = targetWord;
//
//   if (baseTense.PastTense && !targetConjugations.PastTense) {
//     newWord = targetDoc.toPastTense().text();
//   } else if (baseTense.PresentTense && !targetConjugations.PresentTense) {
//     newWord = targetDoc.toPresentTense().text();
//   } else if (baseTense.FutureTense && !targetConjugations.FutureTense) {
//     newWord = targetDoc.toFutureTense().text();
//   }
//
//   return newWord;
// }
