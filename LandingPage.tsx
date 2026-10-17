import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  Flame,
  GitBranch,
  GraduationCap,
  HeartHandshake,
  Layers,
  MapPin,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users2,
  Video,
  Zap,
} from 'lucide-react';
import { TutorProfile, UserProfile } from '../../types';

interface LandingPageProps {
  onEnterApp: (page?: string) => void;
  onSwitchRole: (role: 'learner' | 'tutor') => void;
  onOpenLogin: (role?: 'learner' | 'tutor' | 'admin') => void;
  featuredTutors: { user: UserProfile; profile: TutorProfile }[];
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onSwitchRole,
  onOpenLogin,
  featuredTutors,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 24L16 8L24 24" stroke="#E0E7FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="8" cy="24" r="3" fill="#A5B4FC" />
                <circle cx="24" cy="24" r="3" fill="#A5B4FC" />
                <circle cx="16" cy="8" r="3.5" fill="#FFFFFF" />
                <path d="M16 8V24" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 2"/>
              </svg>
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-700 via-violet-700 to-indigo-900 bg-clip-text text-transparent">
                BrainBridge
              </span>
              <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Peer Learning
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenLogin('learner')}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 px-2 sm:px-3 py-1.5 transition hidden md:inline-block"
            >
              🎓 Student
            </button>
            <button
              onClick={() => onOpenLogin('tutor')}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-emerald-600 px-2 sm:px-3 py-1.5 transition hidden sm:inline-block"
            >
              👨‍🏫 Tutor
            </button>
            <button
              onClick={() => onOpenLogin('admin')}
              className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-purple-600 px-2 sm:px-3 py-1.5 transition hidden lg:inline-block"
            >
              🛡️ Admin
            </button>
            <button
              onClick={() => onOpenLogin()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-500/20 transition active:scale-95"
            >
              <span>Sign In / Register</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Tagline Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200/80 text-indigo-800 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Bridge the Gap. Unlock Your Potential.</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Bridge Learning Gaps{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-800 bg-clip-text text-transparent">
              With Peer Mentors.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            BrainBridge connects verified college students with approved student tutors. Discover your weak topics with diagnostic tests, schedule emergency exam rescue sprints, and verify empirical mastery gains.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={() => {
                onSwitchRole('learner');
                onEnterApp('tutors');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-base shadow-lg shadow-indigo-600/25 transition active:scale-[0.98]"
            >
              <Compass className="w-5 h-5" />
              <span>Find a Tutor</span>
            </button>

            <button
              onClick={() => {
                onSwitchRole('tutor');
                onEnterApp('availability');
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-base border border-slate-300 shadow-sm transition"
            >
              <GraduationCap className="w-5 h-5 text-indigo-600" />
              <span>Become a Tutor</span>
            </button>

            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition"
            >
              <Play className="w-4 h-4 fill-slate-700" />
              <span>Explore Platform Dashboard</span>
            </button>
          </div>

          {/* Stats quick banner */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-slate-200/60 text-slate-700">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-900">100%</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Free Peer Tutoring</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-900">8+</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Engineering Disciplines</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-900">4.9★</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Avg Student Rating</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-900">Zero</p>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Booking Conflicts</p>
            </div>
          </div>
        </div>

        {/* Live Dashboard Preview Mockup */}
        <div className="max-w-6xl mx-auto px-4 mt-12">
          <div className="rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-indigo-500/20 via-violet-500/10 to-transparent border border-indigo-200/60 shadow-2xl">
            <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xl">
              {/* Fake Browser Top Bar */}
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] font-mono text-slate-400 bg-white px-4 py-1 rounded-md border border-slate-200">
                  https://brainbridge.app/dashboard
                </div>
                <div className="text-[11px] text-indigo-600 font-bold">
                  Interactive Preview
                </div>
              </div>

              {/* Mockup Dashboard Content */}
              <div className="p-6 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left col */}
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>BRAINBRIDGE QUEST PROGRESS</span>
                      <span className="text-indigo-600">Level 2 Explorer</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-2">
                      <div className="w-3/5 h-full bg-indigo-600 rounded-full" />
                    </div>
                    <p className="text-xs text-slate-500 font-medium">320 / 500 XP to Achiever rank</p>
                  </div>

                  <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                      <Flame className="w-6 h-6 fill-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800">4-Day Active Streak</p>
                      <p className="text-xs text-slate-500">Consecutive calendar peer sessions</p>
                    </div>
                  </div>
                </div>

                {/* Center col */}
                <div className="p-5 bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-2xl shadow-md flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-indigo-100">
                      Confirmed Next Session
                    </span>
                    <h3 className="text-lg font-bold mt-2">Data Structures &amp; Python</h3>
                    <p className="text-xs text-indigo-200 mt-1">with Sarah Lin (Senior TA)</p>
                    <div className="flex items-center gap-2 mt-3 text-xs text-indigo-300">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Wednesday &bull; 16:00 - 17:00</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnterApp('sessions')}
                    className="mt-4 w-full py-2 bg-white text-indigo-950 font-bold text-xs rounded-xl hover:bg-indigo-50 transition"
                  >
                    Open Session Room
                  </button>
                </div>

                {/* Right col */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                      <span>DAILY QUESTS</span>
                      <span className="text-emerald-600 font-extrabold">+140 XP Today</span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-lg flex items-center justify-between">
                        <span className="font-medium text-slate-700">Find a Tutor</span>
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="p-2 bg-indigo-50/60 rounded-lg flex items-center justify-between border border-indigo-100">
                        <span className="font-semibold text-indigo-900">Define Learning Goal</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-bold">Claim 45 XP</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onEnterApp('quest')}
                    className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800 text-left"
                  >
                    View All Quests & Leaderboard &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              How BrainBridge Works in Three Simple Steps
            </h2>
            <p className="mt-3 text-base text-slate-600">
              A transparent, zero-friction path from confused in class to confident on exam day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition hover:shadow-lg group">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition">
                01
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Discover with Smart Match
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Filter by subject, day, online or on-campus mode, and teaching style (beginner-friendly vs practice-focused). Our rule-based matcher shows exactly why each mentor is recommended.
              </p>
              <span className="text-xs font-semibold text-indigo-600">Transparent Matching Engine &rarr;</span>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-violet-300 transition hover:shadow-lg group">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition">
                02
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Book with Learning Goals
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Select guaranteed open slots and state specific concepts you want to tackle. Tutors accept requests and slots lock instantly to prevent race conditions or double-bookings.
              </p>
              <span className="text-xs font-semibold text-violet-600">Zero-Conflict Calendaring &rarr;</span>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition hover:shadow-lg group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xl mb-6 group-hover:scale-110 transition">
                03
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Level Up &amp; Master Skills
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Both learner and tutor earn XP, maintain active daily learning streaks, unlock rare achievement badges, and illuminate milestones on the interactive visual Skill Tree.
              </p>
              <span className="text-xs font-semibold text-emerald-600">Gamified Ecosystem &rarr;</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dual Value Propositions: Learners vs Tutors */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored for Both Sides of the Learning Equation
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Whether you want to understand binary search trees or build your teaching portfolio for graduate school.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Learners */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">For Learners</h3>
                  <p className="text-xs text-slate-500">Overcome hurdles with friendly campus peers</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Safe, judgment-free space</strong> to ask fundamental questions without feeling intimidated by professors.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Visual Skill Trees</strong> to see prerequisites and recommended next subjects in engineering paths.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Learning Circles</strong> to grind LeetCode, OS kernels, and midterm prep with motivated classmates.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Streak &amp; Quest Rewards</strong> that keep you consistently engaged throughout the semester.</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenLogin('learner')}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition"
              >
                Join as Student &rarr;
              </button>
            </div>

            {/* For Tutors */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">For Tutors</h3>
                  <p className="text-xs text-slate-500">Solidify your knowledge and build teaching credentials</p>
                </div>
              </div>

              <ul className="space-y-3.5 text-sm text-slate-700">
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>The Feynman Technique in action:</strong> Teaching concepts to peers cements your own deep mastery.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Verified Peer Reviews:</strong> Accumulate transparent recommendations to showcase on your CV or LinkedIn.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Tutor Impact Score:</strong> Transparent metrics measuring unique students helped and subjects taught.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Custom Availability Manager:</strong> Publish open hours, set campus locations or Google Meet links effortlessly.</span>
                </li>
              </ul>

              <button
                onClick={() => onOpenLogin('tutor')}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition"
              >
                Sign In as Tutor &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors Spotlight */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Featured Peer Mentors
              </h2>
              <p className="mt-2 text-base text-slate-600">
                Top-rated students from your campus ready to pair program and debug.
              </p>
            </div>
            <button
              onClick={() => onEnterApp('tutors')}
              className="mt-4 md:mt-0 text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <span>Explore All Tutors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {featuredTutors.length === 0 ? (
            <div className="text-center py-12 px-6 rounded-3xl bg-slate-50 border border-dashed border-slate-200">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No peer tutors currently listed</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
                Be the first to share your knowledge! Apply as a verified peer tutor or sign in to register.
              </p>
              <button
                onClick={() => onOpenLogin('learner')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
              >
                Get Started &rarr;
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTutors.slice(0, 3).map(({ user, profile }) => (
                <div
                  key={user.id}
                  className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition flex flex-col justify-between hover:shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-sm"
                      />
                      <div className="text-right">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{profile.rating.toFixed(1)}</span>
                          <span className="text-slate-400 font-normal">({profile.reviewCount})</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Lvl {user.level} {user.levelTitle}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{user.name}</h3>
                    <p className="text-xs text-indigo-600 font-medium">{user.department} &bull; {user.academicYear}</p>

                    <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                      {user.bio}
                    </p>

                    {/* Subjects */}
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {profile.subjects.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-[11px] font-semibold"
                        >
                          {sub.subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{profile.teachingModes.join(' & ')}</span>
                    </span>
                    <button
                      onClick={() => onEnterApp('tutors')}
                      className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      View Slots &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gamification Spotlight: Badges, Quests, Impact Score */}
      <section className="py-20 bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
              Signature Gamification Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mt-4">
              BrainBridge Quest &amp; Community Impact
            </h2>
            <p className="mt-3 text-base text-slate-300">
              Recognizing every hour spent helping others. Transparent points, real achievements, no paywalls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 fill-amber-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white">Calendar Streaks</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Legitimate daily activity checks that reward persistent university study without refresh hacking.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-indigo-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white">8 Unlockable Badges</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                From "First Step" to "Consistency Star" and "Community Hero", unlock badges only when verified events occur.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6 text-emerald-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white">BrainBridge Impact Score</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                A mathematical metric measuring sessions delivered, unique students supported, and peer feedback.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4">
                <GitBranch className="w-6 h-6 text-purple-400" />
              </div>
              <h4 className="font-extrabold text-lg text-white">Visual Skill Tree</h4>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Interactive roadmaps across Programming, Core CS, Problem Solving, and AI with verifiable milestones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Ready to Accelerate Your University Learning?
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
            Experience the complete, deployment-ready BrainBridge peer learning ecosystem.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onEnterApp('dashboard')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition active:scale-95"
            >
              Enter BrainBridge Workspace &rarr;
            </button>
            <button
              onClick={() => onOpenLogin('tutor')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-base transition"
            >
              Sign In as Tutor
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
              B
            </div>
            <div>
              <p className="text-slate-200 font-bold">BrainBridge Platform</p>
              <p className="text-slate-500">Peer Tutoring &amp; Learning Ecosystem</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <p>Teach What You Know. Learn What You Love. Level Up Together.</p>
            <p className="text-slate-500 mt-1">
              Supports Supabase PostgreSQL backend &amp; Local Reactive State fallback.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
