# BrainBridge — Smart College Peer Tutoring & Gamified Learning Platform

> **"Bridge the Gap. Unlock Your Potential."**

BrainBridge is an institutional-grade, full-stack edtech platform engineered for university campuses. It connects verified college students who need academic assistance with certified peer tutors who teach those subjects. Through topic-level diagnostic quizzes, personalized spaced-repetition exam planners, verifiable pre/post session score gains, a reciprocal skill-credit economy, and campus governance, BrainBridge turns semester stress into measurable collaborative mastery.

---

## ⚡ Quick Start & Evaluator Credentials

The platform starts in a **clean production state** without arbitrary mock data. Evaluators can explore in clean state or toggle the **Hackathon Demo Suite** (`[DEMO MODE]` banner) with one click to populate realistic, clearly watermarked sample records.

### 🛡️ Pre-Provisioned Accounts

| Role | Email | Password | PRN / Credentials | Access Level | Primary Dashboard |
|---|---|---|---|---|---|
| 🛡️ **Institutional Admin** | `admin@brainbridge.edu` | `admin123` | `FAC-AUTH-001` (Admin) | Full campus governance, PRN review, tutor certification & audit logs | `/admin-dashboard` |
| 🎓 **Verified Student (Alex Chen)** | `alex.chen@brainbridge.edu` | `student123` | `PRN-2024-1042` | Diagnostic quizzes, Exam Rescue, sessions, skill credits | `/dashboard` |
| 👨‍🏫 **Approved Tutor (Sarah Lin)** | `sarah.lin@brainbridge.edu` | `tutor123` | `PRN-2023-8812` | Tutor studio, slot calendar, session requests, feedback | `/tutor-dashboard` |

> 💡 **Self-Registration:** Any college student can register with their name, college email, PRN, and academic department via the **Sign In / Register** portal. Registration accepts any valid email domain.

---

## 🚀 Ten Core Features

### 1. Smart Tutor Matching
- **Explainable Ranking:** Ranks approved mentors using a transparent scoring algorithm based on subject alignment, student difficult topics, language preference, time slot compatibility, and on-campus vs online delivery.
- **Match Reason Badges:** Clear transparency cards explain recommendations (e.g., *"Strong match: specializes in BCNF Decomposition, speaks English/Hindi, available Wednesday"*).

### 2. Gamified Learning & XP Engine
- **BrainBridge Quest:** Daily and weekly study quests, consecutive calendar session streaks, learner levels, and rare achievement badges (*First Learning Session*, *Seven-Day Streak*, *Java Explorer*, *Helpful Peer*, *Knowledge Sharer*).
- **Privacy Controls:** Opt-in / opt-out toggles for the public campus leaderboard.

### 3. Knowledge Gap Detector
- **Topic-Level Diagnostic Quizzes:** Standardized multi-topic university quizzes in Data Structures & Algorithms, Java Programming, Python Fundamentals, DBMS, and Computer Networks.
- **Automated Score Breakdown:** Objective grading with instant identification of struggling topics, question-by-question explanations, tailored 4-step practice plans, and 1-click booking with mentors specializing in those exact gaps.

### 4. Verified Campus Network & PRN Security
- **PRN Allowlist Enforcement:** College students provide their Permanent Registration Number (PRN). Uniqueness is enforced at the database level.
- **Privacy Masking:** Raw PRNs are cryptographically hashed and masked across all user-facing interfaces (e.g. `PRN-****-1042`).
- **Restricted Pending State:** Unverified accounts cannot book live sessions until verified by university administration.

### 5. Skill Exchange Credits
- **Zero-Cash Reciprocal Economy:** Students teach subjects they know to earn virtual credits (+2 credits per completed 45-min session), and spend credits to book peer tutoring (-1 credit per booking).
- **Ledger & Fair Cancellation:** Cryptographically validated transaction history ledger with automated 100% credit refund upon cancellation or tutor decline. Daily campus citizen grants (+1 credit).

### 6. Micro Learning Circles
- **Subject-Based Communities:** Join or create study groups for DSA, Java, DBMS, Computer Networks, and Placement Preparation.
- **Collaborative Goals:** Weekly group learning milestones, shared study resources, live discussion threads, and upcoming group study sessions.

### 7. Exam Rescue Mode
- **Emergency Revision Sprints:** Spaced-repetition study sprint tailored to an impending exam date.
- **Algorithmically Scheduled Checklist:** Prioritizes self-rated weak topics, provides time allocations, reschedules overdue tasks with 1 click, suggests diagnostic mock quizzes, and matches top peer mentors for syllabus review.

### 8. Before-and-After Learning Score
- **Empirical Progress Verification:** Measures session efficacy with topic-specific pre-session diagnostic quizzes compared directly against post-session mastery assessments.
- **Visual Analytics:** Interactive Recharts score comparison charts, average score delta (+X.X pts / 10), percentage mastery lift, and tutor feedback notes.

### 9. Smart Scheduling & Priority Waitlist
- **Conflict-Free Calendaring:** Guaranteed slot reservations prevent double-booking or scheduling race conditions.
- **Priority Waitlist:** When a tutor's slots are fully booked, students can join a priority waitlist and receive automated in-app notifications the moment a slot opens.

### 10. Trust, Safety, and Institutional Reputation
- **Transparent Reliability Indicators:** Verified student and tutor badges, completed-session count, attendance rate, and peer reviews.
- **Confidential Reporting:** Discreet user-reporting system for academic dishonesty, misleading credentials, or inappropriate conduct.
- **Administrative Governance:** Faculty dashboard with user suspensions, tutor application vetting, PRN allowlist imports, and immutable audit logs.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React icons
- **Visualizations:** Recharts (responsive bar and comparison charts)
- **Gamification:** Canvas Confetti, XP progression engine, streak calculator
- **Backend & Database:** Supabase Authentication, PostgreSQL with Row Level Security (RLS)
- **Storage Layer:** Dual-mode architecture with automated LocalStorage fallback and full Supabase client support

---

## 🔒 Security Architecture & RLS Enforcement

The database schema and security rules are structured in three PostgreSQL migrations in `supabase/migrations/`:

1. `20250101000000_peerup_schema.sql`: Core tables, session requests, and notifications.
2. `20250102000000_security_prn_tutor_verification.sql`: PRN verification roster, tutor certification workflow, role privilege escalation defenses, and audit trails.
3. `20250103000000_credits_diagnostics_exam_rescue.sql`: Skill exchange credit ledger, diagnostic quiz results, exam rescue plans, learning score assessments, and scheduling waitlists.

### Automated Security Test Suite

Run the comprehensive security test suite locally:
```bash
npm test
```
**Test Results: 10/10 Passed (100% Success)**
- Test 1: Unapproved PRN Student Restricted from Protected Features
- Test 2: Duplicate PRN Registration Prevention
- Test 3: Student Cannot Change Own Verification Status
- Test 4: Privilege Escalation Prevention (Role Protection)
- Test 5: Unapproved Tutor Restrictions Enforced
- Test 6: Normal User Blocked from Admin Operations
- Test 7: Private Student Data Protection & PRN Masking
- Test 8: Zero Secret Exposure in Frontend Codebase
- Test 9: PostgreSQL Database RLS Policies Enforce Server-Side Rejection
- Test 10: Admin Approval Workflow Updates Status & Logs Actions

---

## 💻 Local Development Setup

### 1. Clone & Install
```bash
git clone <repo-url>
cd buildthon
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Provide your Supabase URL and anon key if using cloud Supabase:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
*(If unconfigured, BrainBridge automatically operates in offline storage mode with zero setup required).*

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
Generates an optimized bundle in `dist/` with zero TypeScript errors.

---

## 🎓 Hackathon Judging Walkthrough

1. **Clean Production State:** Notice that by default, the database contains zero fake users.
2. **Launch Demo Suite:** Click **"Load Hackathon Demo Suite"** in the top banner. Notice sample records appear with clear `[SAMPLE DATA]` watermarks.
3. **Switch to Alex Chen (Student):**
   - Open **Diagnostic Quiz** (`/knowledge-check`), take a 5-question test on DBMS or DSA, review your Knowledge Gap report, and inspect personalized practice plans.
   - Open **Exam Rescue Mode** (`/exam-rescue`), view the 3-day countdown, check off prioritized revision items (+15 XP), and reschedule overdue tasks.
   - Open **Skill Credits** (`/credits`), view the ledger, and claim your Daily Campus Grant (+1 Credit).
   - Open **Learning Scores** (`/progress`), inspect the pre- vs post-quiz delta chart showing +4.8 pts average gain.
4. **Switch to Sarah Lin (Tutor):**
   - Open **Tutor Studio** (`/tutor-dashboard`), review incoming booking requests, accept sessions, and manage availability slots.
5. **Switch to Dr. Thorne (Admin):**
   - Open **Safety & Audit** (`/admin-dashboard`), review PRN verification requests, unmask PRNs with authorized toggle, approve tutor applications, and inspect the tamper-evident audit log.
6. **Reset Anytime:** Click **"Reset to Clean"** in the banner to return to empty production state.
 OUR PROJECT PRESENTATION LINK:- https://youtu.be/7gB51PPXNpI?si=CGO6tF4UZnBcqoRY 
