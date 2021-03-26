import Fuse from 'fuse.js';

// compare files - two files submission
/**
 *
 * @param {String} firstFile - first file to compare
 * @param {String} secondFile - second file to be compared
 * @returns {Number} percentageDifference - returns the percentage differnce between the two files
 */
export const compareFiles = async (firstFile, secondFile) => {
  const wordsToSearch = firstFile.split(' ');

  const options = {
    isCaseSensitive: false,
    includeScore: true,
    shouldSort: true,
    findAllMatches: true,
    minMatchCharLength: 3,
    threshold: 1.0,
    useExtendedSearch: true,
    ignoreLocation: true,
    ignoreFieldNorm: true,
    keys: wordsToSearch,
  };

  const fuse = new Fuse(wordsToSearch, options);
  const pattern = secondFile.replace(/\s/g, '|');
  const results = fuse.search(pattern);
  const allMatches = results.filter((result) => result.score < 0.5).length;
  const baseWords = wordsToSearch.length;
  const percentageDifference = (allMatches / baseWords) * 100;

  // results can be empty === no matches found
  if (
    !Array.isArray(results) ||
    !results.length ||
    results.length === 0 ||
    results === undefined
  ) {
    percentageDifference = 0;
  }
  return percentageDifference;
};


