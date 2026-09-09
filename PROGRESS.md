# Orange IELTS — Build Progress

## Done

### Backend Setup
- [x] Express server with helmet, CORS, dotenv
- [x] MongoDB Atlas connected (M0 free tier)
- [x] Folder structure: models, routes, controllers, middleware, utils, seeds
- [x] Standard API response helpers (successResponse, errorResponse)
- [x] JSON body limit increased to 5MB (for avatar uploads)
- [x] Optional auth middleware (attaches user if token present, otherwise null)
- [x] Admin role + isAdmin middleware

### Listening — Fully on API
- [x] ListeningTest model + seed (36 tests, books 11-19)
- [x] AnswerKey model + seed (36 listening answer keys)
- [x] Transcript model + seed (35 transcripts, C13 Test 3 missing)
- [x] GET `/api/listening/:examType/books/:bookSlug/tests/:testSlug`
- [x] GET `.../answers`
- [x] GET `.../transcript`
- [x] GET `/api/listening/:examType/books` — static book listing with user scores + locked status
- [x] POST `.../submit` — server-side scoring (requires auth, blocks locked tests)
- [x] Frontend fetches all listening data from API

### Reading — Fully on API
- [x] ReadingTest model + seed (36 tests, books 11-19)
- [x] AnswerKey seed for reading (36 reading answer keys, forced `book-XX-reading-test-X` format)
- [x] GET `/api/reading/:examType/books/:bookSlug/tests/:testSlug`
- [x] GET `.../answers`
- [x] GET `/api/reading/:examType/books` — static book listing with user scores + locked status
- [x] POST `.../submit` — server-side scoring (requires auth, blocks locked tests)
- [x] Frontend fetches all reading data from API
- [x] Book listing optimized — static build, no heavy DB query

### Test Attempts & Scoring — Done
- [x] TestAttempt model (user, testId, skill, score, bandScore, timeSpent, answers, results, isLate)
- [x] Server-side scoring utility (ported from frontend, handles SINGLE + MULTIPLE + range)
- [x] Submit endpoints for both listening and reading (auth required)
- [x] All attempts saved to DB (multiple retakes preserved)
- [x] Latest score shown on book listing pages
- [x] Frontend submit flow: POST to backend first, fallback to client scoring if not logged in
- [x] TestResultPage uses server-scored results when available
- [x] Mock interceptor removed — all data flows through real API
- [x] GET `/api/attempts/:id` — returns full attempt with user answers (for review from progress page)

### Free Plan Limits — Done
- [x] Plan limits utility (`utils/planLimits.js`)
- [x] Free plan: Book 11 (all 4 tests) + Book 12 (Test 1 & 2) = 6 free tests per skill
- [x] Backend: submit endpoint returns 403 for locked tests on free plan
- [x] Backend: books listing includes `locked` field per test based on user plan
- [x] Frontend: locked tests show "Upgrade to Pro" button with lock icon (disabled)
- [x] Frontend: unlocked tests show normal "Start Test" / "Retake" buttons
- [x] Paid users (pro/premium) see everything unlocked

### Auth System — Done
- [x] User model (name, email, password, avatar, role, plan)
- [x] RefreshToken model (single device policy, TTL auto-cleanup)
- [x] JWT middleware (access token verification)
- [x] POST `/api/auth/register` — with validation (name, email, password rules)
- [x] POST `/api/auth/login`
- [x] POST `/api/auth/refresh` — token rotation
- [x] POST `/api/auth/logout` — invalidate refresh token
- [x] GET `/api/auth/me` — protected
- [x] POST `/api/auth/google` — Google OAuth sign-in/sign-up
- [x] Login page (`/login`) with email/password + Google Sign-In
- [x] Register page (`/register`) with validation + Google Sign-Up
- [x] Auth store (Jotai atoms: userAtom, isAuthenticatedAtom, isAuthLoadingAtom)
- [x] useAuth hook (login, register, googleLogin, logout, hydrate)
- [x] Session hydration on app mount (runs once via ref guard)
- [x] Auth guard — unauthenticated users see popup modal with Sign In / Create Account
- [x] returnTo param preserved across login/register pages
- [x] Navbar — shows user initial/avatar when logged in, Sign In dropdown when not
- [x] Toast notifications (sonner) for auth success/error
- [x] ErrorBoundary shows toast instead of error page, auto-recovers
- [x] Access token lifetime: 7 days (dev), reduce for production

### Password Reset — Done
- [x] PasswordResetToken model (token, user, expiresAt, used, TTL auto-cleanup)
- [x] POST `/api/auth/forgot-password` — generates token, sends email via Resend
- [x] POST `/api/auth/reset-password` — validates token, updates password, invalidates sessions
- [x] Forgot password page (`/forgot-password`) — email input, "Check your email" confirmation
- [x] Reset password page (`/reset-password?token=xxx`) — new password form, success screen
- [x] Email sent via Resend (from `onboarding@resend.dev`, production needs own domain)
- [x] Reset tokens expire in 1 hour, previous tokens invalidated on new request

### Rate Limiting — Done
- [x] Login: 10 attempts per 15 minutes
- [x] Register: 5 accounts per hour
- [x] Forgot password: 3 requests per 15 minutes
- [x] Google auth: 10 attempts per 15 minutes

### User Profile — Done
- [x] Profile page (`/profile`) with user info display
- [x] PATCH `/api/user/profile` — update name, avatar
- [x] PATCH `/api/user/password` — change password (validates current password)
- [x] Avatar upload with image cropper (react-easy-crop) — zoom via scroll/pinch
- [x] Avatar delete (red trash icon on hover)
- [x] Name editing inline
- [x] Password change form with validation
- [x] Profile persists to MongoDB (survives refresh)

### My Progress — Done
- [x] GET `/api/user/progress` — stats + paginated attempt history (filterable by skill incl. writing)
- [x] Progress page (`/progress`) with:
  - 4 stat cards (Tests Taken, Avg Band, Best Score, Time Spent)
  - Listening/Reading/Writing skill breakdown (avg + best per skill, pending count for writing)
  - All / Listening / Reading / Writing tabs with loading spinner on tab switch
  - Full history table (test name, band score color-coded, correct/40 or word count, time, date + local time)
  - Review button for listening/reading attempts (fetches full attempt with answers)
  - Writing entries show "Pending" badge or "Awaiting review" / "Graded" status
  - Pagination
- [x] Navbar "My Progress" links wired (desktop + mobile)

### Writing Module — Done
- [x] WritingSubmission model (user, testId, taskNumber, prompt, response, wordCount, status, bandScore, feedback)
- [x] POST `/api/writing/submit` — user submits writing (auth required)
- [x] GET `/api/writing/submissions` — user sees their submissions
- [x] GET `/api/writing/submissions/:id` — single submission detail
- [x] Writing test page (`/:examType/writing/:testId`) — split pane with draggable divider, Task 1/Task 2 tabs in footer, word counter, auto-grow textarea, task image support
- [x] Uses same Header component as listening/reading
- [x] Section header banner (Part 1/Part 2 with time + word guidelines)
- [x] Submit sends both tasks together
- [x] Writing listing page buttons wired with auth guard
- [x] Writing submissions shown on progress page

### Admin Panel — Done
- [x] Admin role on User model + isAdmin middleware
- [x] GET `/api/admin/submissions` — list all writing submissions (filterable by status)
- [x] GET `/api/admin/submissions/:id` — full submission detail
- [x] PATCH `/api/admin/submissions/:id/grade` — grade with IELTS criteria + feedback
- [x] Admin page (`/admin`) — list pending/graded, view detail, "Copy for Claude" button, grade form with 4 criteria + auto band score + comments

### Server-Side Timer Enforcement — Done
- [x] `isLate` field on TestAttempt model
- [x] Listening: flags as late if timeSpent > 32 min (30 + 2 grace)
- [x] Reading: flags as late if timeSpent > 62 min (60 + 2 grace)
- [x] Backend still accepts and scores late submissions (flagged, not rejected)
- [x] Frontend auto-submits when timer hits 0 (3-second countdown)
- [x] "Time's Up!" overlay with auto-submit message and "Submit Now" button

### Pricing Page — Updated
- [x] 3 duration cards: 1 Month ($19), 2 Months ($29), 6 Months ($79)
- [x] Per-month price + total + savings percentage
- [x] FAQ updated for bank transfer payment

### UI Polish
- [x] Listening person SVG — added eyes and smile (matching Speaking face) on home page and listing page
- [x] Clock SVG — fixed minute hand rotation (native SVG animateTransform, pivots from center)
- [x] Route-level navbar/footer visibility control in App.tsx (no flicker, no atom-based loops)
  - Test detail pages, result pages, review pages all handled via `shouldHideNavbarFooter(pathname)`
  - Removed `setNavbarFooterVisible` useEffect from all individual pages
- [x] Separate footer visibility for profile/progress pages
- [x] Volume setting persisted to localStorage + applied on audio element mount
- [x] User's real name shown in test header (not "Student-book-11...")
- [x] Band score 0 correctly displayed on listing pages (not "0% Not taken")
- [x] Hydrate runs once via ref guard (prevents infinite re-render loop)
- [x] Review page correctAnswers optional chaining fix
- [x] Navbar dropdowns changed to hover-based (no scroll blocking, smooth chevron rotation)
- [x] IELTS Online Test dropdown: two-column layout (Academic | General Training) with proper links
- [x] Mobile menu: Academic + General Training sections with correct links
- [x] Dropdown right-aligned with trigger button

### Report Mistake — Done
- [x] Report model (user, testId, reportType, questionNumber, description, status)
- [x] POST `/api/reports` — user submits report (auth required)
- [x] GET `/api/admin/reports` — admin lists reports (filterable by status)
- [x] PATCH `/api/admin/reports/:id/status` — admin updates status (open/reviewed/resolved/dismissed)
- [x] ReportMistakeButton wired to API with toast feedback
- [x] Auto-captures testId from URL

### Admin Panel — Enhanced
- [x] AdminLayout with sidebar (wraps all admin pages, checks auth + admin role)
- [x] AdminSidebar with nav items: Dashboard, Users, Writing Submissions, Bugs Reported
- [x] Avatar + name/email at sidebar bottom with hover menu (Profile, Sign Out)
- [x] GET `/api/admin/dashboard` — stats + paginated activity feed
- [x] Dashboard page (`/admin`) with:
  - 4 stat cards (Total Users, Tests Taken, Writing Pending, Bugs Open)
  - Recent activity feed with pagination (only activity reloads on page change, cards stay)
  - Color-coded icons per activity type, "X min/hr ago" timestamps
- [x] Writing Submissions page (`/admin/submissions`) — grading flow + pagination
- [x] Users page (`/admin/users`) — full table with:
  - Search by name/email (Apply + Reset buttons)
  - Filter by plan (Free/Pro/Premium) and status (Active/Blocked)
  - Change plan dropdown per user
  - Block/Unblock toggle (invalidates tokens when blocked)
  - Delete user + all related data (with confirmation)
  - Blocked users can't login (403)
  - Can't block/delete admin accounts
  - Pagination
- [x] Bugs Reported page (`/admin/reports`) — full page with:
  - Filter tabs (open/reviewed/resolved/dismissed/all)
  - Click to view full report detail
  - Action buttons: Resolve, Dismiss, Mark Reviewed
  - Pagination
- [x] Navbar hidden on all admin pages
- [x] Admin navbar: only avatar with Profile + Sign Out (no user-facing nav items)
- [x] Admin login redirects to `/admin` (email, Google, register)
- [x] `/` redirects to `/admin` for admin users
- [x] Admin user creation via CLI command
- [x] `isBlocked` field on User model

### Reusable Components — Done
- [x] `<Pagination>` — reusable prev/next with "Page X of Y", always visible
- [x] `<ListLoader>` — orange spinner with "Loading..." for all list loading states
- [x] `parsePagination()` — backend utility using `Backend/constants/index.js` defaults (change once, applies everywhere)
- [x] `<AuthRequiredModal>` — popup for unauthenticated users
- [x] `<ImageCropper>` — avatar crop with zoom
- [x] `<AdminLayout>` — sidebar + auth check wrapper
- [x] `<AdminSidebar>` — nav + avatar menu

---

## Remaining

### Nice to Have
- [ ] Speaking module
- [ ] Full Mock Test feature (all 4 skills in one session)
- [ ] Explain/Locate buttons on review page
- [ ] Verify own domain in Resend for production emails
- [ ] Clean up unused static JSON files and mocks from frontend
- [ ] Reduce access token lifetime for production (currently 7 days)
- [ ] Wire dead buttons (Hero CTAs, Academic/General page test buttons, Settings)
- [ ] Replace hardcoded mock data on Academic/General/Speaking pages with API data

---

## Database (MongoDB Atlas M0)

| Collection | Documents |
|---|---|
| listeningtests | 36 |
| readingtests | 36 |
| answerkeys | 72 |
| transcripts | 35 |
| users | dynamic |
| refreshtokens | dynamic |
| testattempts | dynamic |
| passwordresettokens | dynamic |
| writingsubmissions | dynamic |
| reports | dynamic |
| **Total** | **179 + dynamic** |

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind 4, Jotai, React Router |
| Backend | Node.js 22, Express 5, Mongoose |
| Database | MongoDB Atlas (M0 free) |
| Auth | JWT (access + refresh) + Google OAuth |
| Email | Resend |
| Notifications | Sonner (toast) |
| Image Cropper | react-easy-crop |
| Charts | Recharts (installed, not yet used) |
