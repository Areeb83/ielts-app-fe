# Orange IELTS — Pre-Deployment Checklist

## 1. Domain & Hosting

- [ ] Buy a domain (e.g., `orangeielts.com`)
- [ ] Choose frontend hosting (Vercel / Netlify — free tier)
- [ ] Choose backend hosting (Render / Railway — free tier)
- [ ] Point domain to frontend hosting
- [ ] Set up subdomain for API (e.g., `api.orangeielts.com`) or use same domain with `/api` proxy

---

## 2. Environment Variables (Production)

### Backend `.env` (set in hosting dashboard, NOT in code)

| Variable | Value | Notes |
|---|---|---|
| `PORT` | `8000` or auto | Some hosts set this automatically |
| `MONGODB_URI` | `mongodb+srv://...` | Same Atlas URI, but whitelist hosting IP |
| `JWT_SECRET` | Generate new 64-char random string | `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `GOOGLE_CLIENT_ID` | `769789140981-...` | Update authorized origins in Google Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Same as dev |
| `RESEND_API_KEY` | `re_...` | Same key works |
| `FRONTEND_URL` | `https://orangeielts.com` | Used in password reset emails |

### Frontend `.env` (set in hosting dashboard)

| Variable | Value | Notes |
|---|---|---|
| `VITE_API_BASE_URL` | `https://api.orangeielts.com/api` | Production API URL |
| `VITE_GOOGLE_CLIENT_ID` | `769789140981-...` | Same as dev |

---

## 3. MongoDB Atlas

- [ ] Whitelist production server IP in **Network Access** (or use `0.0.0.0/0` if IP is dynamic)
- [ ] Create a separate production database user with a strong password
- [ ] Update `MONGODB_URI` with production credentials
- [ ] Enable **MongoDB Atlas alerts** for storage/connection limits (M0 has 512MB limit)

---

## 4. Google OAuth (Production)

### Update Google Cloud Console

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- [ ] Click your OAuth client → add production URLs:
  - **Authorized JavaScript origins**: `https://orangeielts.com`
  - **Authorized redirect URIs**: `https://orangeielts.com`
- [ ] Keep `localhost:3000` entries for local development

### Publish OAuth Consent Screen

- [ ] Go to **OAuth consent screen**
- [ ] Click **"Publish App"** (moves from Testing → Production)
- [ ] Without publishing, only test users (max 100) can use Google Sign-In
- [ ] If you request sensitive scopes, Google may require verification (basic profile scope usually doesn't)

---

## 5. Resend Email (Production)

### Verify Your Domain

- [ ] Go to [Resend Dashboard](https://resend.com) → **Domains** → **Add Domain**
- [ ] Enter your domain (e.g., `orangeielts.com`)
- [ ] Add the DNS records Resend gives you (MX, TXT, DKIM) in your domain registrar
- [ ] Wait for verification (usually 5-30 minutes)
- [ ] Update the `from` field in `authController.js`:
  ```
  from: 'onboarding@resend.dev'  →  from: 'noreply@orangeielts.com'
  ```

### Without Domain Verification
- Emails will only send to the email address you signed up to Resend with
- `onboarding@resend.dev` works but looks unprofessional

---

## 6. Security

- [ ] Generate a **new JWT_SECRET** for production (don't reuse development secret)
- [ ] Remove any hardcoded passwords or secrets from code
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Enable HTTPS (most hosting platforms do this automatically)
- [ ] Update CORS in `Backend/index.js` to only allow your production domain:
  ```js
  app.use(cors({ origin: 'https://orangeielts.com' }));
  ```
- [ ] Set secure cookie options if using cookies in the future
- [ ] Review rate limiting values for production traffic

---

## 7. Frontend Build

- [ ] Run `npm run build` in Frontend — fix any build errors
- [ ] Test the production build locally: `npm run preview`
- [ ] Ensure all API calls use `VITE_API_BASE_URL` (no hardcoded `localhost`)
- [ ] Add `_redirects` or `vercel.json` for SPA routing (all paths → `index.html`)

### Vercel (`vercel.json`)
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### Netlify (`public/_redirects`)
```
/*    /index.html   200
```

---

## 8. Backend Deployment

- [ ] Add a `start` script to `Backend/package.json`:
  ```json
  "start": "node index.js"
  ```
- [ ] Remove `--watch` from production (it's dev-only)
- [ ] Test that the server starts without the Frontend folder (seeding reads from Frontend JSON files — either seed before deploying or bundle the seed data)
- [ ] **Important**: The seed script reads from `../Frontend/src/data/` — this path won't exist on the production server. Options:
  - Seed the database locally before deploying (data already in Atlas)
  - Copy seed data into Backend folder
  - Skip seeding in production (data is already in MongoDB Atlas)

---

## 9. Database Seeding (One-Time)

- [ ] Ensure all 36 listening tests are seeded
- [ ] Ensure all 36 reading tests are seeded
- [ ] Ensure all 72 answer keys are seeded
- [ ] Ensure all 35 transcripts are seeded
- [ ] Verify by running:
```bash
cd Backend
node -e "
require('dotenv').config();
const mongoose = require('mongoose');
(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const LT = require('./models/ListeningTest');
  const RT = require('./models/ReadingTest');
  const AK = require('./models/AnswerKey');
  const TR = require('./models/Transcript');
  console.log('Listening tests:', await LT.countDocuments());
  console.log('Reading tests:', await RT.countDocuments());
  console.log('Answer keys:', await AK.countDocuments());
  console.log('Transcripts:', await TR.countDocuments());
  await mongoose.disconnect();
})();
"
```
Expected output:
```
Listening tests: 36
Reading tests: 36
Answer keys: 72
Transcripts: 35
```
- [ ] Once seeded, the production server doesn't need the Frontend JSON files

---

## 10. Testing Before Launch

- [ ] Register a new account (email + password)
- [ ] Register with Google
- [ ] Login / Logout
- [ ] Forgot password → receive email → reset password → login with new password
- [ ] Take a listening test (free: C11) → submit → see score → review
- [ ] Take a reading test (free: C11) → submit → see score → review
- [ ] Try a locked test (C13+) → see "Upgrade to Pro" button
- [ ] Check My Progress page → see attempt history
- [ ] Update profile name, avatar, password
- [ ] Test on mobile (responsive layout)
- [ ] Test with slow network (loading states)

---

## 11. Optional — Before or After Launch

- [ ] Add favicon and meta tags (`<title>`, Open Graph, etc.)
- [ ] Add `robots.txt` and `sitemap.xml` for SEO
- [ ] Set up error monitoring (Sentry free tier)
- [ ] Set up analytics (Google Analytics, Plausible, or Posthog)
- [ ] Create a proper 404 page
- [ ] Add terms of service and privacy policy pages
- [ ] Set up uptime monitoring (UptimeRobot free tier)

---

## 12. Unused Files (Clean Up Before Deploy)

These files are no longer imported by any active code. Move to a separate branch or delete before deploying to reduce bundle size.

### Static Data Maps (replaced by API)
- `Frontend/src/data/testDataMaps.ts` — was the static JSON import map for all 72 tests. No file imports it anymore. Pulls in all 72 JSON files which bloats the bundle.

### Mock System (replaced by real API)
- `Frontend/src/mocks/index.ts` — barrel export for mock system
- `Frontend/src/mocks/mockInterceptor.ts` — intercepted axios calls with fake responses
- `Frontend/src/mocks/listeningMockData.ts` — generated fake book listings and scores

### JSON Data Files
All files under `Frontend/src/data/academic/` (books 11-19, listening + reading) are **still needed** by the backend seed script (`Backend/utils/database.js`). The seed reads these files on server startup to populate MongoDB.

**Once MongoDB is fully seeded (which it already is), these files are only needed if:**
- You reset the database and need to re-seed
- You add new tests and need to seed them

### Files Still in Use (Do NOT Delete)

| File | Used By |
|---|---|
| `src/data/answerKeys.ts` | TestResultPage, ReviewPage (client-side scoring fallback for unauthenticated users) |
| `src/data/transcriptMaps.ts` | ReviewPage, TranscriptPane (fetchTranscript function + type exports) |
| `src/data/audio-durations.json` | TestDetailContainer (listening test timer calculation) |

---

## 13. Backend Seed Script Dependency

The seed script at `Backend/utils/database.js` reads JSON files from:
```
Frontend/src/data/academic/book-{11-19}/listening/test-{1-4}.json
Frontend/src/data/academic/book-{11-19}/listening/test-{1-4}-answers.json
Frontend/src/data/academic/book-{11-19}/listening/test-{1-4}-transcript.json
Frontend/src/data/academic/book-{11-19}/reading/test-{1-4}.json
Frontend/src/data/academic/book-{11-19}/reading/test-{1-4}-answers.json
```

For production deployment, either:
1. **Keep the JSON files** — simplest, seed runs on every server start (skips if already seeded)
2. **Remove seed from startup** — comment out `await seedAll()` in `index.js` since data is already in Atlas
3. **Move JSON files to Backend** — copy `Frontend/src/data/academic/` to `Backend/seed-data/` and update paths in `database.js`

---

## 14. Known Issues

- `book-13 test-3` transcript is missing (was never created, deferred indefinitely)
- `answerKeys.ts` exports a sync `getAnswerKey()` that always returns null — only `fetchAnswerKey()` (async, hits API) is used. Could be removed.
- `transcriptMaps.ts` exports a sync `getTranscript()` that always returns null — same situation, only `fetchTranscript()` is used. Could be removed.

---

## Quick Reference: Deployment Commands

### Frontend (Vercel)
```bash
cd Frontend
npm run build
# Deploy via Vercel CLI or connect GitHub repo
npx vercel --prod
```

### Backend (Render)
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Build command: npm install
# Start command: node index.js
```

### Seed Database (run locally, one-time)
```bash
cd Backend
node -e "
require('dotenv').config();
const { connectDB, seedAll, disconnectDB } = require('./utils/database');
(async () => {
  await connectDB();
  await seedAll();
  await disconnectDB();
})();
"
```
