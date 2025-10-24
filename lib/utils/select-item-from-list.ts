/**
 * Select item from list that is not in the set.
 *
 * @param list
 * @param set
 */
export const selectItemFromListThatIsNotInSet = (
  list: string[],
  set: Set<string>,
): string | null => {
  for (let i = 0; i < list.length; i++) {
    const wordCandidate = list[i];
    if (set.has(wordCandidate)) {
      continue;
    }
    return wordCandidate;
  }

  return null;
};
