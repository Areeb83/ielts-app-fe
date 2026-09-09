/**
 * Seed script: Inserts book-11 listening tests (all 4) into MongoDB.
 *
 * Usage:  node seeds/seedListeningBook11.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const ListeningTest = require('../models/ListeningTest');

const MONGODB_URI = process.env.MONGODB_URI;
const BOOK_DIR = path.join(__dirname, '..', '..', 'Frontend', 'src', 'data', 'academic', 'book-11', 'listening');

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const testFiles = ['test-1.json', 'test-2.json', 'test-3.json', 'test-4.json'];

    for (const file of testFiles) {
      const filePath = path.join(BOOK_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const testData = JSON.parse(raw);

      // Upsert: update if exists, insert if not
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
        { upsert: true, new: true }
      );

      console.log(`Seeded: ${testData.testId}`);
    }

    console.log('\nDone! 4 listening tests seeded for book-11.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
