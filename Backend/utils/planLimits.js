/**
 * Free plan: Book 11 (all 4 tests) + Book 12 Test 1 = 5 tests per skill.
 * Returns true if the test is accessible on the free plan.
 */
function isTestFree(testId) {
  // Listening: "book-11-test-1", Reading: "book-11-reading-test-1"
  const listeningMatch = testId.match(/^book-(\d+)-test-(\d+)$/);
  const readingMatch = testId.match(/^book-(\d+)-reading-test-(\d+)$/);

  const match = listeningMatch || readingMatch;
  if (!match) return false;

  const bookNum = parseInt(match[1]);
  const testNum = parseInt(match[2]);

  // Book 11: all 4 tests free
  if (bookNum === 11) return true;
  // Book 12: test 1 and test 2 free
  if (bookNum === 12 && testNum <= 2) return true;

  return false;
}

module.exports = { isTestFree };
