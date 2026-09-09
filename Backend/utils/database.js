const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

/**
 * Connect to MongoDB Atlas.
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');
}

/**
 * Helper: resolve a skill directory for a book.
 */
function getBookDir(bookNumber, skill) {
  return path.join(
    __dirname, '..', '..', 'Frontend', 'src', 'data', 'academic',
    `book-${bookNumber}`, skill
  );
}

// ─── Listening Seeders ──────────────────────────────────────────────────────

async function seedListeningTests(bookNumber) {
  const ListeningTest = require('../models/ListeningTest');
  const bookId = `book-${bookNumber}`;

  const existing = await ListeningTest.countDocuments({ bookId });
  if (existing >= 4) return 0;

  const bookDir = getBookDir(bookNumber, 'listening');
  if (!fs.existsSync(bookDir)) return 0;

  let count = 0;
  for (let t = 1; t <= 4; t++) {
    const filePath = path.join(bookDir, `test-${t}.json`);
    if (!fs.existsSync(filePath)) continue;

    const testData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    await ListeningTest.findOneAndUpdate(
      { testId: testData.testId },
      {
        testId: testData.testId,
        bookId: testData.bookId,
        skill: 'listening',
        examType: 'academic',
        title: testData.title,
        audioSrc: testData.audioSrc,
        totalQuestions: testData.totalQuestions,
        sections: testData.sections,
      },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }
  return count;
}

async function seedListeningAnswers(bookNumber) {
  const AnswerKey = require('../models/AnswerKey');
  const bookId = `book-${bookNumber}`;

  const existing = await AnswerKey.countDocuments({ testId: { $regex: `^${bookId}-test-` }, skill: 'listening' });
  if (existing >= 4) return 0;

  const bookDir = getBookDir(bookNumber, 'listening');
  if (!fs.existsSync(bookDir)) return 0;

  let count = 0;
  for (let t = 1; t <= 4; t++) {
    const filePath = path.join(bookDir, `test-${t}-answers.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const testId = data.testId || `${bookId}-test-${t}`;

    await AnswerKey.findOneAndUpdate(
      { testId, skill: 'listening' },
      { testId, skill: 'listening', answers: data.answers },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }
  return count;
}

async function seedListeningTranscripts(bookNumber) {
  const Transcript = require('../models/Transcript');
  const bookId = `book-${bookNumber}`;

  const bookDir = getBookDir(bookNumber, 'listening');
  if (!fs.existsSync(bookDir)) return 0;

  const existing = await Transcript.countDocuments({ testId: { $regex: `^${bookId}-test-` } });
  const transcriptFiles = [1, 2, 3, 4].filter(t => fs.existsSync(path.join(bookDir, `test-${t}-transcript.json`)));
  if (existing >= transcriptFiles.length) return 0;

  let count = 0;
  for (let t = 1; t <= 4; t++) {
    const filePath = path.join(bookDir, `test-${t}-transcript.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const testId = data.testId || `${bookId}-test-${t}`;

    await Transcript.findOneAndUpdate(
      { testId },
      { testId, sections: data.sections },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }
  return count;
}

// ─── Reading Seeders ────────────────────────────────────────────────────────

async function seedReadingTests(bookNumber) {
  const ReadingTest = require('../models/ReadingTest');
  const bookId = `book-${bookNumber}`;

  const existing = await ReadingTest.countDocuments({ bookId });
  if (existing >= 4) return 0;

  const bookDir = getBookDir(bookNumber, 'reading');
  if (!fs.existsSync(bookDir)) return 0;

  let count = 0;
  for (let t = 1; t <= 4; t++) {
    const filePath = path.join(bookDir, `test-${t}.json`);
    if (!fs.existsSync(filePath)) continue;

    const testData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Always force correct format: book-XX-reading-test-X
    const testId = `${bookId}-reading-test-${t}`;

    await ReadingTest.findOneAndUpdate(
      { testId },
      {
        testId,
        bookId: testData.bookId || bookId,
        skill: 'reading',
        examType: 'academic',
        title: testData.title,
        totalQuestions: testData.totalQuestions || 40,
        sections: testData.sections,
      },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }
  return count;
}

async function seedReadingAnswers(bookNumber) {
  const AnswerKey = require('../models/AnswerKey');
  const bookId = `book-${bookNumber}`;

  const existing = await AnswerKey.countDocuments({ testId: { $regex: `^${bookId}-reading-test-` }, skill: 'reading' });
  if (existing >= 4) return 0;

  const bookDir = getBookDir(bookNumber, 'reading');
  if (!fs.existsSync(bookDir)) return 0;

  let count = 0;
  for (let t = 1; t <= 4; t++) {
    const filePath = path.join(bookDir, `test-${t}-answers.json`);
    if (!fs.existsSync(filePath)) continue;

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    // Force reading testId format: "book-11-reading-test-1"
    const testId = `${bookId}-reading-test-${t}`;

    await AnswerKey.findOneAndUpdate(
      { testId, skill: 'reading' },
      { testId, skill: 'reading', answers: data.answers },
      { upsert: true, returnDocument: 'after' }
    );
    count++;
  }
  return count;
}

// ─── Seed All ───────────────────────────────────────────────────────────────

async function seedAll() {
  for (let book = 11; book <= 19; book++) {
    // Listening
    const lTests = await seedListeningTests(book);
    const lAnswers = await seedListeningAnswers(book);
    const lTranscripts = await seedListeningTranscripts(book);

    // Reading
    const rTests = await seedReadingTests(book);
    const rAnswers = await seedReadingAnswers(book);

    const total = lTests + lAnswers + lTranscripts + rTests + rAnswers;
    if (total > 0) {
      const parts = [];
      if (lTests > 0) parts.push(`${lTests} listening tests`);
      if (lAnswers > 0) parts.push(`${lAnswers} listening answers`);
      if (lTranscripts > 0) parts.push(`${lTranscripts} transcripts`);
      if (rTests > 0) parts.push(`${rTests} reading tests`);
      if (rAnswers > 0) parts.push(`${rAnswers} reading answers`);
      console.log(`Seeded book-${book}: ${parts.join(', ')}`);
    } else {
      console.log(`book-${book} already seeded, skipping`);
    }
  }
}

/**
 * Disconnect from MongoDB.
 */
async function disconnectDB() {
  await mongoose.disconnect();
}

module.exports = { connectDB, seedAll, disconnectDB };
