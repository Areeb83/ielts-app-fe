require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { connectDB, seedAll } = require('./utils/database');
const authRoutes = require('./routes/auth');
const listeningRoutes = require('./routes/listening');
const readingRoutes = require('./routes/reading');
const userRoutes = require('./routes/user');
const writingRoutes = require('./routes/writing');
const adminRoutes = require('./routes/admin');
const attemptRoutes = require('./routes/attempts');
const reportRoutes = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/listening', listeningRoutes);
app.use('/api/reading', readingRoutes);
app.use('/api/user', userRoutes);
app.use('/api/writing', writingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/reports', reportRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Orange IELTS Backend API' });
});

// Start server: connect DB → seed data → listen
async function start() {
  await connectDB();
  await seedAll();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
