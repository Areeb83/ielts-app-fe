/**
 * Server-side scoring utility.
 * Ported from Frontend/src/utils/scoring.ts
 */

const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ');

function isAnswerCorrect(userAnswer, acceptedAnswers) {
  if (!userAnswer) return false;

  if (Array.isArray(userAnswer)) {
    return userAnswer.some((ua) =>
      acceptedAnswers.some((aa) => normalize(ua) === normalize(aa))
    );
  }

  return acceptedAnswers.some((aa) => normalize(userAnswer) === normalize(aa));
}

/**
 * Score a test by comparing user answers against the answer key.
 * @param {Object} userAnswers - { "1": "B", "2": "answer", "25 – 26": ["B", "D"] }
 * @param {Object} answerKeyDoc - { testId, answers: [{ questionNumber, answerType, acceptedAnswers, count? }] }
 * @returns {{ correct, total, bandScore, results: [{ questionNumber, isCorrect }] }}
 */
function scoreTest(userAnswers, answerKeyDoc) {
  const answers = userAnswers || {};
  const results = [];
  let correct = 0;

  for (const entry of answerKeyDoc.answers) {
    const qNumStr = String(entry.questionNumber);

    // Check if this is a multi-select range entry like "25-26"
    const rangeMatch = qNumStr.match(/^(\d+)\s*[–-]\s*(\d+)$/);
    if (rangeMatch && entry.count) {
      const start = Number(rangeMatch[1]);
      const end = Number(rangeMatch[2]);
      const answerKey1 = `${start} – ${end}`;
      const answerKey2 = `${start}-${end}`;
      const answerKey3 = `${start} - ${end}`;
      const userAnswer =
        answers[answerKey1] ?? answers[answerKey2] ?? answers[answerKey3] ?? answers[qNumStr];
      const userArr = Array.isArray(userAnswer) ? userAnswer : [];

      for (let n = start; n <= end; n++) {
        const idx = n - start;
        const singleUserAnswer = userArr[idx] ?? '';
        const isMatch = entry.acceptedAnswers.some(
          (aa) => normalize(singleUserAnswer) === normalize(aa)
        );
        if (isMatch) correct++;
        results.push({ questionNumber: n, isCorrect: isMatch });
      }
    } else {
      const userAnswer = answers[qNumStr];
      const isMatch = isAnswerCorrect(userAnswer, entry.acceptedAnswers);
      if (isMatch) correct++;
      results.push({
        questionNumber:
          typeof entry.questionNumber === 'string'
            ? Number(entry.questionNumber) || 0
            : entry.questionNumber,
        isCorrect: isMatch,
      });
    }
  }

  const total = results.length;

  return {
    correct,
    total,
    bandScore: getBandScore(correct),
    results,
  };
}

function getBandScore(correct) {
  if (correct >= 39) return 9.0;
  if (correct >= 37) return 8.5;
  if (correct >= 35) return 8.0;
  if (correct >= 33) return 7.5;
  if (correct >= 30) return 7.0;
  if (correct >= 27) return 6.5;
  if (correct >= 23) return 6.0;
  if (correct >= 20) return 5.5;
  if (correct >= 16) return 5.0;
  if (correct >= 13) return 4.5;
  if (correct >= 10) return 4.0;
  if (correct >= 7) return 3.5;
  if (correct >= 4) return 3.0;
  if (correct >= 2) return 2.5;
  if (correct >= 1) return 2.0;
  return 0;
}

module.exports = { scoreTest, getBandScore, normalize };
