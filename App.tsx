import React, { useEffect, useState } from 'react';
import {
  ActivityLog,
  ApprovedPRN,
  AuthSession,
  AvailabilitySlot,
  ContentReport,
  DailyQuest,
  InAppNotification,
  LeaderboardEntry,
  LearningCircle,
  SessionRequest,
  SessionReview,
  SkillTreeNode,
  StudentVerificationRequest,
  TutorApplication,
  TutorProfile,
  UserProfile,
  UserRole,
} from './types';
import { LocalStorageAdapter } from './services/storage';
import { rankTutors } from './services/matching';
import { getLevelForXP } from './services/gamification';
import { api } from './services/api';
import { maskPRN } from './services/security';

// Icons
import { AlertCircle, Clock, ShieldAlert, ShieldCheck, X } from 'lucide-react';

// Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LevelUpModal } from './components/common/LevelUpModal';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { TutorDashboard } from './components/dashboard/TutorDashboard';
import { TutorDirectory } from './components/tutors/TutorDirectory';
import { BookingModal } from './components/tutors/BookingModal';
import { SmartMatcherModal } from './components/tutors/SmartMatcherModal';
import { SessionsHub } from './components/sessions/SessionsHub';
import { SessionRoomModal } from './components/sessions/SessionRoomModal';
import { QuestHub } from './components/gamification/QuestHub';
import { SkillTreeView } from './components/skill-tree/SkillTreeView';
import { LearningCirclesHub } from './components/circles/LearningCirclesHub';
import { TutorAvailabilityManager } from './components/tutor-availability/TutorAvailabilityManager';
import { AdminPortal } from './components/admin/AdminPortal';
import { TutorApplicationModal } from './components/tutors/TutorApplicationModal';
import { PRNVerificationGatekeeper } from './components/common/PRNVerificationGatekeeper';
import { KnowledgeGapDetector } from './components/diagnostic/KnowledgeGapDetector';
import { ExamRescuePlanner } from './components/exam-rescue/ExamRescuePlanner';
import { BeforeAfterLearningScore } from './components/progress/BeforeAfterLearningScore';
import { SkillExchangeHub } from './components/credits/SkillExchangeHub';
import { DemoModeBanner } from './components/common/DemoModeBanner';
import { ReportModal } from './components/common/ReportModal';

export function App() {
  // Navigation & Page State (Persistent across browser refresh)
  const [currentPage, setCurrentPage] = useState<string>(() => {
    const saved = localStorage.getItem('college_lms_current_page');
    const token = localStorage.getItem('college_lms_token');
    const protectedPages = [
      'dashboard',
      'student-dashboard',
      'admin-dashboard',
      'admin',
      'tutor-dashboard',
      'availability',
      'sessions',
      'quest',
      'skill-tree',
      'circles',
      'exam-rescue',
      'progress',
      'credits',
    ];
    if (!token && saved && protectedPages.includes(saved)) {
      return 'login';
    }
    return saved || 'landing';
  });
  const [loginRolePrompt, setLoginRolePrompt] = useState<UserRole | undefined>('learner');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accessDeniedMessage, setAccessDeniedMessage] = useState<string | null>(null);

  // Core Data State
  const [currentUser, setCurrentUser] = useState<UserProfile>(
    LocalStorageAdapter.getCurrentUser()
  );
  const [authSession, setAuthSession] = useState<AuthSession | null>(
    LocalStorageAdapter.getAuthSession()
  );
  const [allUsers, setAllUsers] = useState<UserProfile[]>(
    LocalStorageAdapter.getUsers()
  );
  const [tutorProfiles, setTutorProfiles] = useState<TutorProfile[]>(
    LocalStorageAdapter.getTutorProfiles()
  );
  const [slots, setSlots] = useState<AvailabilitySlot[]>(
    LocalStorageAdapter.getSlots()
  );
  const [sessions, setSessions] = useState<SessionRequest[]>(
    LocalStorageAdapter.getSessions()
  );
  const [reviews, setReviews] = useState<SessionReview[]>(
    LocalStorageAdapter.getReviews()
  );
  const [quests, setQuests] = useState<DailyQuest[]>(
    LocalStorageAdapter.getQuests()
  );
  const [skillNodes, setSkillNodes] = useState<SkillTreeNode[]>(
    LocalStorageAdapter.getSkillNodes()
  );
  const [circles, setCircles] = useState<LearningCircle[]>(
    LocalStorageAdapter.getCircles()
  );
  const [notifications, setNotifications] = useState<InAppNotification[]>(
    LocalStorageAdapter.getNotifications(currentUser.id)
  );
  const [reports, setReports] = useState<ContentReport[]>(
    LocalStorageAdapter.getReports()
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    LocalStorageAdapter.getActivityLogs()
  );
  const [approvedPRNs, setApprovedPRNs] = useState<ApprovedPRN[]>(
    LocalStorageAdapter.getApprovedPRNs()
  );
  const [verificationRequests, setVerificationRequests] = useState<StudentVerificationRequest[]>(
    LocalStorageAdapter.getVerificationRequests()
  );
  const [tutorApplications, setTutorApplications] = useState<TutorApplication[]>(
    LocalStorageAdapter.getTutorApplications()
  );
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    LocalStorageAdapter.getLeaderboard('all')
  );

  // Modals State
  const [showSmartMatcher, setShowSmartMatcher] = useState<boolean>(false);
  const [bookingTutorId, setBookingTutorId] = useState<string | null>(null);
  const [activeSessionRoom, setActiveSessionRoom] = useState<SessionRequest | null>(null);
  const [showTutorAppModal, setShowTutorAppModal] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{
    levelInfo: ReturnType<typeof getLevelForXP>;
    newXP: number;
  } | null>(null);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);

  // Sync state from storage
  const syncFromStorage = () => {
    const user = LocalStorageAdapter.getCurrentUser();
    setCurrentUser(user);
    setAuthSession(LocalStorageAdapter.getAuthSession());
    setAllUsers(LocalStorageAdapter.getUsers());
    setTutorProfiles(LocalStorageAdapter.getTutorProfiles());
    setSlots(LocalStorageAdapter.getSlots());
    setSessions(LocalStorageAdapter.getSessions());
    setReviews(LocalStorageAdapter.getReviews());
    setQuests(LocalStorageAdapter.getQuests());
    setSkillNodes(LocalStorageAdapter.getSkillNodes());
    setCircles(LocalStorageAdapter.getCircles());
    setNotifications(LocalStorageAdapter.getNotifications(user.id));
    setReports(LocalStorageAdapter.getReports());
    setActivityLogs(LocalStorageAdapter.getActivityLogs());
    setApprovedPRNs(LocalStorageAdapter.getApprovedPRNs());
    setVerificationRequests(LocalStorageAdapter.getVerificationRequests());
    setTutorApplications(LocalStorageAdapter.getTutorApplications());
    setLeaderboard(LocalStorageAdapter.getLeaderboard('all'));
  };

  useEffect(() => {
    const handleStorageUpdate = () => {
      syncFromStorage();
    };
    window.addEventListener('brainbridge-storage-update', handleStorageUpdate);
    return () => {
      window.removeEventListener('brainbridge-storage-update', handleStorageUpdate);
    };
  }, []);

  // Restore authenticated session from persistent SQLite database on mount or page refresh
  useEffect(() => {
    const restoreSession = async () => {
      const token = api.getToken() || localStorage.getItem('college_lms_token');
      const protectedPages = [
        'dashboard',
        'student-dashboard',
        'admin-dashboard',
        'admin',
        'tutor-dashboard',
        'availability',
        'sessions',
        'quest',
        'skill-tree',
        'circles',
        'exam-rescue',
        'progress',
        'credits',
      ];

      if (!token) {
        if (protectedPages.includes(currentPage)) {
          setCurrentPage('login');
          localStorage.setItem('college_lms_current_page', 'login');
        }
        return;
      }

      try {
        const user = await api.getCurrentUser();
        if (user) {
          const profile: UserProfile = {
            id: user.id,
            name: user.name,
            email: user.email,
            avatar: user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
            role: user.role === 'admin' ? 'admin' : user.role === 'tutor' ? 'tutor' : 'learner',
            department: user.department || 'Computer Science and Engineering (CSE)',
            academicYear: user.academic_year || 'First Year',
            semester: user.semester || 'Semester 1',
            prn: user.prn || '',
            prnMasked: user.prn ? maskPRN(user.prn) : '',
            bio: user.bio || '',
            xp: user.xp || 100,
            level: 1,
            levelTitle: user.role === 'admin' ? 'Administrator' : user.role === 'tutor' ? 'Certified Tutor' : 'Student Learner',
            streakDays: 1,
            bestStreak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            impactScore: 0,
            verified: true,
            badges: [],
            status: 'active',
            verificationStatus: 'approved',
            isTutorApproved: user.role === 'tutor',
            creditBalance: 10,
            languages: ['English'],
            themePreference: 'light',
            optOutOfLeaderboard: false,
          };

          const users = LocalStorageAdapter.getUsers();
          const idx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
          if (idx !== -1) {
            users[idx] = { ...users[idx], ...profile };
          } else {
            users.push(profile);
          }
          LocalStorageAdapter.saveUsers(users);
          LocalStorageAdapter.setCurrentUserId(profile.id);
          setCurrentUser(profile);
          setAuthSession({
            userId: profile.id,
            role: profile.role,
            token: token,
            loginTime: new Date().toISOString(),
          });

          // Check role restrictions on restored page
          const savedPage = localStorage.getItem('college_lms_current_page') || 'dashboard';
          if ((savedPage === 'admin-dashboard' || savedPage === 'admin') && profile.role !== 'admin') {
            setCurrentPage('dashboard');
            localStorage.setItem('college_lms_current_page', 'dashboard');
          } else if (savedPage === 'login' || savedPage === 'register') {
            const dest = profile.role === 'admin' ? 'admin-dashboard' : profile.role === 'tutor' ? 'tutor-dashboard' : 'dashboard';
            setCurrentPage(dest);
            localStorage.setItem('college_lms_current_page', dest);
          } else {
            setCurrentPage(savedPage);
          }
        } else {
          api.clearToken();
          localStorage.removeItem('college_lms_current_page');
          LocalStorageAdapter.logout();
          syncFromStorage();
          if (protectedPages.includes(currentPage)) {
            setCurrentPage('login');
          }
        }
      } catch (err) {
        console.error('Session restore failed:', err);
      }
    };

    restoreSession();
  }, []);

  // Role-Based Route Guard and Navigation
  const handleNavigate = (targetPage: string = 'dashboard') => {
    // If attempting to open protected page without an active session, redirect to login
    const token = api.getToken() || localStorage.getItem('college_lms_token');
    const protectedPages = [
      'dashboard',
      'student-dashboard',
      'admin-dashboard',
      'admin',
      'tutor-dashboard',
      'availability',
      'sessions',
      'quest',
      'skill-tree',
      'circles',
      'exam-rescue',
      'progress',
      'credits',
    ];

    if (!token && protectedPages.includes(targetPage)) {
      setAccessDeniedMessage('Authentication required: Please log in with your credentials to access your student portal.');
      setCurrentPage('login');
      localStorage.setItem('college_lms_current_page', 'login');
      return;
    }

    const userRole = currentUser.role;

    // Apply to Tutor shortcut
    if (targetPage === 'apply-tutor') {
      setShowTutorAppModal(true);
      return;
    }

    // 1. Admin restricted routes
    if (targetPage === 'admin-dashboard' || targetPage === 'admin') {
      if (userRole !== 'admin') {
        const redirectPage = userRole === 'tutor' ? 'tutor-dashboard' : 'dashboard';
        setAccessDeniedMessage(
          `Access Denied: The Admin Control Center is restricted to campus administrators. You have been safely redirected to your ${
            userRole === 'tutor' ? 'Tutor Studio' : 'Student Dashboard'
          }.`
        );
        setCurrentPage(redirectPage);
        localStorage.setItem('college_lms_current_page', redirectPage);
        return;
      }
    }

    // 2. Tutor restricted routes
    if (targetPage === 'tutor-dashboard' || targetPage === 'availability') {
      if (userRole !== 'tutor' && userRole !== 'admin') {
        setAccessDeniedMessage(
          'Access Denied: The Tutor Studio and Slot Manager are reserved for certified Peer Tutors. Please submit a tutor application to gain access.'
        );
        setCurrentPage('dashboard');
        localStorage.setItem('college_lms_current_page', 'dashboard');
        return;
      }
    }

    // 3. Clear notice and navigate
    setAccessDeniedMessage(null);
    setCurrentPage(targetPage);
    localStorage.setItem('college_lms_current_page', targetPage);
  };

  // Auth Handlers
  const handleLoginSuccess = (role: UserRole) => {
    syncFromStorage();
    setAccessDeniedMessage(null);
    let target = 'dashboard';
    if (role === 'admin') {
      target = 'admin-dashboard';
    } else if (role === 'tutor') {
      target = 'tutor-dashboard';
    } else {
      target = 'dashboard';
    }
    setCurrentPage(target);
    localStorage.setItem('college_lms_current_page', target);
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      // Ignore network errors on logout
    }
    api.clearToken();
    localStorage.removeItem('college_lms_current_page');
    LocalStorageAdapter.logout();
    syncFromStorage();
    setAccessDeniedMessage(null);
    setCurrentPage('login');
  };

  const handleOpenLogin = (role?: UserRole) => {
    setLoginRolePrompt(role);
    setCurrentPage('login');
    localStorage.setItem('college_lms_current_page', 'login');
  };

  // User Switching Handlers (for demo evaluation)
  const handleSwitchUser = (userId: string) => {
    LocalStorageAdapter.setCurrentUserId(userId);
    const user = LocalStorageAdapter.getCurrentUser();
    setCurrentUser(user);
    setNotifications(LocalStorageAdapter.getNotifications(user.id));
    setAccessDeniedMessage(null);

    // Ensure page corresponds to switched role
    if (
      user.role === 'learner' &&
      (currentPage === 'tutor-dashboard' ||
        currentPage === 'admin' ||
        currentPage === 'admin-dashboard' ||
        currentPage === 'availability')
    ) {
      setCurrentPage('dashboard');
    } else if (
      user.role === 'tutor' &&
      (currentPage === 'admin' || currentPage === 'admin-dashboard')
    ) {
      setCurrentPage('tutor-dashboard');
    } else if (user.role === 'admin' && currentPage === 'dashboard') {
      setCurrentPage('admin-dashboard');
    }
  };

  const handleSwitchRole = (role: 'learner' | 'tutor') => {
    const targetUser = allUsers.find((u) => u.role === role);
    if (targetUser) {
      handleSwitchUser(targetUser.id);
      handleNavigate(role === 'tutor' ? 'tutor-dashboard' : 'dashboard');
    }
  };

  const handleResetDemoData = () => {
    LocalStorageAdapter.resetAllData();
    syncFromStorage();
    alert('Demo data has been reset to default state.');
  };

  // Admin User Moderation Handlers
  const handleToggleUserStatus = (userId: string) => {
    LocalStorageAdapter.toggleUserStatus(userId);
    syncFromStorage();
  };

  const handleToggleUserVerification = (userId: string) => {
    LocalStorageAdapter.toggleUserVerification(userId);
    syncFromStorage();
  };

  const handleDeleteUser = (userId: string) => {
    LocalStorageAdapter.deleteUser(userId);
    syncFromStorage();
  };

  // PRN Verification Handlers
  const handleApproveStudentVerification = (requestId: string) => {
    LocalStorageAdapter.approveStudentVerification(requestId);
    syncFromStorage();
  };

  const handleRejectStudentVerification = (requestId: string, reason: string) => {
    LocalStorageAdapter.rejectStudentVerification(requestId, reason);
    syncFromStorage();
  };

  const handleAddApprovedPRN = (data: {
    prn: string;
    studentName: string;
    email: string;
    department: string;
    academicYear: string;
  }) => {
    LocalStorageAdapter.addApprovedPRN(data);
    syncFromStorage();
  };

  const handleImportApprovedPRNs = (
    prnList: { prn: string; studentName: string; email: string; department: string; academicYear: string }[]
  ) => {
    LocalStorageAdapter.importApprovedPRNs(prnList);
    syncFromStorage();
  };

  // Tutor Application Handlers
  const handleApproveTutorApplication = (applicationId: string) => {
    LocalStorageAdapter.approveTutorApplication(applicationId);
    syncFromStorage();
  };

  const handleRejectTutorApplication = (applicationId: string, reason: string) => {
    LocalStorageAdapter.rejectTutorApplication(applicationId, reason);
    syncFromStorage();
  };

  // Gamification & Quest Handlers
  const handleClaimQuest = (questId: string) => {
    const xpReward = LocalStorageAdapter.claimQuestReward(questId);
    if (xpReward > 0) {
      syncFromStorage();
    }
  };

  // Session Handlers
  const handleConfirmBooking = (bookingData: {
    slotId: string;
    subject: string;
    learningGoal: string;
    mode: 'online' | 'in_person';
    date: string;
    startTime: string;
    endTime: string;
    locationOrLink: string;
  }) => {
    if (!bookingTutorId) return;

    try {
      LocalStorageAdapter.createSessionRequest({
        slotId: bookingData.slotId,
        learnerId: currentUser.id,
        tutorId: bookingTutorId,
        subject: bookingData.subject,
        date: bookingData.date,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        mode: bookingData.mode,
        locationOrLink: bookingData.locationOrLink,
        learningGoal: bookingData.learningGoal,
        notes: 'Session requested. Pending tutor confirmation.',
      });

      setBookingTutorId(null);
      syncFromStorage();
      handleNavigate('sessions');
    } catch (err: any) {
      alert(err.message || 'Booking failed.');
    }
  };

  const handleAcceptSession = (sessionId: string) => {
    try {
      LocalStorageAdapter.updateSessionStatus(
        sessionId,
        'accepted',
        'Session confirmed. See you then!'
      );
      syncFromStorage();
    } catch (err: any) {
      alert(err.message || 'Action failed.');
    }
  };

  const handleDeclineSession = (sessionId: string) => {
    LocalStorageAdapter.updateSessionStatus(
      sessionId,
      'declined',
      'Unable to accommodate this session request.'
    );
    syncFromStorage();
  };

  const handleCompleteSession = (sessionId: string, notes?: string) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    LocalStorageAdapter.updateSessionStatus(sessionId, 'completed', notes);

    // Award XP to learner (+100 XP) and tutor (+150 XP)
    const learnerResult = LocalStorageAdapter.awardXP(
      session.learnerId,
      100,
      `Completed ${session.subject} tutoring session`
    );
    const tutorResult = LocalStorageAdapter.awardXP(
      session.tutorId,
      150,
      `Taught ${session.subject} tutoring session`
    );

    // Check achievement badges
    LocalStorageAdapter.unlockBadge(session.learnerId, 'first_step');
    LocalStorageAdapter.unlockBadge(session.tutorId, 'first_step');

    // Trigger daily quest 3: "Complete a Peer Tutoring Session"
    LocalStorageAdapter.incrementQuestProgress('complete_session');

    // If current user leveled up, show celebration
    if (currentUser.id === session.learnerId && learnerResult.leveledUp) {
      setLevelUpData({
        levelInfo: getLevelForXP(learnerResult.newXP),
        newXP: learnerResult.newXP,
      });
    } else if (currentUser.id === session.tutorId && tutorResult.leveledUp) {
      setLevelUpData({
        levelInfo: getLevelForXP(tutorResult.newXP),
        newXP: tutorResult.newXP,
      });
    }

    syncFromStorage();
    setActiveSessionRoom(null);
  };

  const handleSubmitReview = (
    sessionId: string,
    rating: number,
    feedback: string
  ) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;

    LocalStorageAdapter.addReview({
      sessionId,
      tutorId: session.tutorId,
      learnerId: session.learnerId,
      rating,
      feedback,
    });

    syncFromStorage();
    setActiveSessionRoom(null);
  };

  const handleCompleteMilestone = (nodeId: string, milestoneId: string) => {
    LocalStorageAdapter.completeMilestone(nodeId, milestoneId);
    syncFromStorage();
  };

  // Aggregated Tutors with Slots
  const fullTutors = tutorProfiles.map((profile) => {
    const user = allUsers.find((u) => u.id === profile.userId) || allUsers[1];
    const tutorSlots = slots.filter((s) => s.tutorId === profile.userId);
    return { user, profile, slots: tutorSlots };
  });

  // Recommended tutors for student dashboard
  const recommendedTutors = rankTutors(fullTutors, {
    subject: 'Data Structures',
    teachingStyle: 'beginner_friendly',
  });

  const pendingRequestsCount = sessions.filter(
    (s) => s.tutorId === currentUser.id && s.status === 'pending'
  ).length;

  const tutorToBook = fullTutors.find((t) => t.user.id === bookingTutorId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* 1. Landing Page View */}
      {currentPage === 'landing' ? (
        <LandingPage
          onEnterApp={handleNavigate}
          onSwitchRole={handleSwitchRole}
          onOpenLogin={handleOpenLogin}
          featuredTutors={fullTutors}
        />
      ) : currentPage === 'login' ? (
        /* 2. Login & PRN Registration Portal View */
        <AuthPage
          initialRole={loginRolePrompt || 'learner'}
          onSuccess={handleLoginSuccess}
          onCancelToLanding={() => {
            setCurrentPage('landing');
            localStorage.setItem('college_lms_current_page', 'landing');
          }}
        />
      ) : (
        /* 3. Main Authenticated App View (Student, Tutor, Admin) */
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Navbar with User Role Badge and Logout */}
          <Navbar
            currentUser={currentUser}
            allUsers={allUsers}
            onSwitchUser={handleSwitchUser}
            notifications={notifications}
            onNotificationClick={(notif) => {
              LocalStorageAdapter.markNotificationRead(notif.id);
              syncFromStorage();
              if (notif.relatedId) {
                const sess = sessions.find((s) => s.id === notif.relatedId);
                if (sess) {
                  setActiveSessionRoom(sess);
                } else {
                  handleNavigate('sessions');
                }
              }
            }}
            onMarkAllRead={() => {
              LocalStorageAdapter.markAllNotificationsRead(currentUser.id);
              syncFromStorage();
            }}
            onResetDemoData={handleResetDemoData}
            onNavigate={handleNavigate}
            currentPage={currentPage}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLogout={handleLogout}
          />

          {/* Access Denied Toast Banner */}
          {accessDeniedMessage && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-3 sm:px-6 transition-all animate-in fade-in duration-200">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
                  <p className="text-xs sm:text-sm font-semibold text-rose-900">
                    {accessDeniedMessage}
                  </p>
                </div>
                <button
                  onClick={() => setAccessDeniedMessage(null)}
                  className="p-1 rounded-lg hover:bg-rose-100 text-rose-600 transition"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Student PRN Verification Pending Header Alert Banner */}
          {currentUser.role === 'learner' && currentUser.verificationStatus === 'pending' && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-semibold text-amber-900">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0" />
                  <span>
                    <strong>Student PRN Verification In Progress:</strong> Your Permanent Registration Number (
                    <span className="font-mono">{currentUser.prnMasked || 'PRN-****-Pending'}</span>
                    ) is queued for college registrar approval. Booking live sessions is temporarily locked until verified.
                  </span>
                </div>
                <button
                  onClick={() => handleNavigate('tutors')}
                  className="text-amber-800 underline hover:text-amber-950 shrink-0 hidden sm:inline"
                >
                  Browse Tutors in Read-Only Mode
                </button>
              </div>
            </div>
          )}

          {/* Student PRN Verification Declined Alert */}
          {currentUser.role === 'learner' && currentUser.verificationStatus === 'rejected' && (
            <div className="bg-rose-50 border-b border-rose-200 px-4 py-2.5 sm:px-6">
              <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 text-xs font-semibold text-rose-900">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Student PRN Verification Declined:</strong> {currentUser.rejectionReason || 'PRN could not be matched with active student records.'} Please contact the campus administration.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Layout: Role-Aware Collapsible Sidebar + Dynamic View Container */}
          <div className="flex-1 flex overflow-hidden">
            <Sidebar
              currentPage={currentPage}
              onNavigate={handleNavigate}
              currentUser={currentUser}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() =>
                setIsSidebarCollapsed(!isSidebarCollapsed)
              }
              pendingRequestsCount={pendingRequestsCount}
            />

            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
              {/* Student Dashboard (Default for Learners) */}
              {(currentPage === 'dashboard' || currentPage === 'student-dashboard') && (
                <Dashboard
                  currentUser={currentUser}
                  upcomingSessions={sessions.filter(
                    (s) =>
                      (s.learnerId === currentUser.id ||
                        s.tutorId === currentUser.id) &&
                      (s.status === 'accepted' || s.status === 'pending')
                  )}
                  recommendedTutors={recommendedTutors.map((r) => ({
                    user: r.tutor,
                    profile: r.tutorProfile,
                    matchReasons: r.matchReasons,
                  }))}
                  dailyQuests={quests}
                  onClaimQuest={handleClaimQuest}
                  onNavigate={handleNavigate}
                  onOpenSession={(sess) => setActiveSessionRoom(sess)}
                  onBookTutor={(tutorId) => setBookingTutorId(tutorId)}
                  leaderboardTop={leaderboard.map((l) => ({
                    rank: l.rank,
                    name: l.name,
                    avatar: l.avatar,
                    xp: l.totalXP,
                    levelTitle: l.levelTitle,
                  }))}
                  onLogout={handleLogout}
                />
              )}

              {/* Dedicated Tutor Dashboard Studio */}
              {currentPage === 'tutor-dashboard' && (
                <TutorDashboard
                  currentUser={currentUser}
                  tutorProfile={tutorProfiles.find(
                    (p) => p.userId === currentUser.id
                  )}
                  sessions={sessions}
                  allUsers={allUsers}
                  slots={slots}
                  reviews={reviews}
                  onAcceptSession={handleAcceptSession}
                  onDeclineSession={handleDeclineSession}
                  onAddSlot={(newSlot) => {
                    LocalStorageAdapter.addSlot(newSlot);
                    syncFromStorage();
                  }}
                  onDeleteSlot={(slotId) => {
                    LocalStorageAdapter.deleteSlot(slotId);
                    syncFromStorage();
                  }}
                  onOpenSessionRoom={(sess) => setActiveSessionRoom(sess)}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Dedicated Admin Portal Control Center */}
              {(currentPage === 'admin-dashboard' || currentPage === 'admin') && (
                <AdminPortal
                  currentUser={currentUser}
                  allUsers={allUsers}
                  tutorProfiles={tutorProfiles}
                  sessions={sessions}
                  reports={reports}
                  activityLogs={activityLogs}
                  circles={circles}
                  quests={quests}
                  approvedPRNs={approvedPRNs}
                  verificationRequests={verificationRequests}
                  tutorApplications={tutorApplications}
                  onUpdateReportStatus={(repId, status) => {
                    LocalStorageAdapter.updateReportStatus(repId, status);
                    syncFromStorage();
                  }}
                  onToggleUserStatus={handleToggleUserStatus}
                  onToggleUserVerification={handleToggleUserVerification}
                  onDeleteUser={handleDeleteUser}
                  onApproveStudentVerification={handleApproveStudentVerification}
                  onRejectStudentVerification={handleRejectStudentVerification}
                  onAddApprovedPRN={handleAddApprovedPRN}
                  onImportApprovedPRNs={handleImportApprovedPRNs}
                  onApproveTutorApplication={handleApproveTutorApplication}
                  onRejectTutorApplication={handleRejectTutorApplication}
                  onResetDemoData={handleResetDemoData}
                  onLogout={handleLogout}
                />
              )}

              {/* Tutor Directory */}
              {currentPage === 'tutors' && (
                <TutorDirectory
                  tutors={fullTutors}
                  onOpenBooking={(tutorId) => setBookingTutorId(tutorId)}
                  onOpenSmartMatcher={() => setShowSmartMatcher(true)}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              )}

              {/* Sessions Hub */}
              {currentPage === 'sessions' && (
                <SessionsHub
                  sessions={sessions}
                  currentUser={currentUser}
                  allUsers={allUsers}
                  reviews={reviews}
                  onAcceptSession={handleAcceptSession}
                  onDeclineSession={handleDeclineSession}
                  onOpenSessionRoom={(sess) => setActiveSessionRoom(sess)}
                />
              )}

              {/* Quests & Leaderboard Hub */}
              {currentPage === 'quest' && (
                <QuestHub
                  currentUser={currentUser}
                  dailyQuests={quests}
                  onClaimQuest={handleClaimQuest}
                  leaderboard={leaderboard}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Interactive Skill Tree */}
              {currentPage === 'skill-tree' && (
                <SkillTreeView
                  nodes={skillNodes}
                  onCompleteMilestone={handleCompleteMilestone}
                  currentUser={currentUser}
                  onBookSubjectTutor={(subject) => {
                    setSearchQuery(subject);
                    handleNavigate('tutors');
                  }}
                />
              )}

              {/* Learning Circles Community Hub */}
              {currentPage === 'circles' && (
                <LearningCirclesHub
                  circles={circles}
                  currentUser={currentUser}
                  onCreateCircle={(circleData) => {
                    LocalStorageAdapter.createCircle({
                      ...circleData,
                      leaderId: currentUser.id,
                    });
                    syncFromStorage();
                  }}
                  onJoinCircle={(circleId) => {
                    LocalStorageAdapter.joinCircle(circleId);
                    syncFromStorage();
                  }}
                  onLeaveCircle={(circleId) => {
                    LocalStorageAdapter.leaveCircle(circleId);
                    syncFromStorage();
                  }}
                  onPostUpdate={(circleId, content) => {
                    LocalStorageAdapter.postCircleUpdate(circleId, content);
                    syncFromStorage();
                  }}
                  onToggleLike={(circleId, updateId) => {
                    LocalStorageAdapter.toggleLikeCircleUpdate(
                      circleId,
                      updateId
                    );
                    syncFromStorage();
                  }}
                />
              )}

              {/* Tutor Availability Manager */}
              {currentPage === 'availability' && (
                <TutorAvailabilityManager
                  currentUser={currentUser}
                  tutorProfile={tutorProfiles.find(
                    (p) => p.userId === currentUser.id
                  )}
                  slots={slots}
                  onAddSlot={(newSlot) => {
                    LocalStorageAdapter.addSlot(newSlot);
                    syncFromStorage();
                  }}
                  onDeleteSlot={(slotId) => {
                    LocalStorageAdapter.deleteSlot(slotId);
                    syncFromStorage();
                  }}
                  onUpdateProfile={(profileUpdates, userUpdates) => {
                    const prof = tutorProfiles.find(
                      (p) => p.userId === currentUser.id
                    );
                    if (prof) {
                      LocalStorageAdapter.updateTutorProfile({
                        ...prof,
                        ...profileUpdates,
                      });
                    }
                    LocalStorageAdapter.updateUser({
                      ...currentUser,
                      ...userUpdates,
                    });
                    syncFromStorage();
                  }}
                />
              )}

              {/* Feature Three: Knowledge Gap Detector */}
              {(currentPage === 'knowledge-check' || currentPage === 'diagnostics') && (
                <KnowledgeGapDetector
                  currentUser={currentUser}
                  quizzes={LocalStorageAdapter.getDiagnosticQuizzes()}
                  results={LocalStorageAdapter.getDiagnosticResults(currentUser.id)}
                  allTutors={allUsers
                    .filter((u) => u.role === 'tutor')
                    .map((u) => ({
                      user: u,
                      profile: tutorProfiles.find((p) => p.userId === u.id) || {
                        userId: u.id,
                        subjects: [],
                        teachingModes: ['online', 'in_person'],
                        teachingStyle: 'practice_focused',
                        rating: 4.8,
                        reviewCount: 12,
                        locationPreference: 'Campus Library',
                        verified: true,
                      },
                    }))}
                  onOpenBooking={(tutorId, subject) => {
                    if (subject) setSearchQuery(subject);
                    setBookingTutorId(tutorId);
                  }}
                  onNavigate={handleNavigate}
                />
              )}

              {/* Feature Seven: Exam Rescue Mode */}
              {currentPage === 'exam-rescue' && (
                <ExamRescuePlanner
                  currentUser={currentUser}
                  onNavigateToKnowledgeCheck={(subj) => {
                    setSearchQuery(subj);
                    handleNavigate('knowledge-check');
                  }}
                  onNavigateToTutors={(subj) => {
                    setSearchQuery(subj);
                    handleNavigate('tutors');
                  }}
                />
              )}

              {/* Feature Eight: Before-and-After Learning Score */}
              {currentPage === 'progress' && (
                <BeforeAfterLearningScore currentUser={currentUser} />
              )}

              {/* Feature Five: Skill Exchange Credits Hub */}
              {currentPage === 'credits' && (
                <SkillExchangeHub
                  currentUser={currentUser}
                  onNavigateToDiscover={() => handleNavigate('tutors')}
                  onNavigateToTutorApply={() => setShowTutorAppModal(true)}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Global Modals */}

      {/* 1. Smart Matcher Questionnaire Modal */}
      {showSmartMatcher && (
        <SmartMatcherModal
          tutors={fullTutors}
          onSelectTutorToBook={(tutorId) => setBookingTutorId(tutorId)}
          onClose={() => setShowSmartMatcher(false)}
        />
      )}

      {/* 2. Slot Booking Modal with PRN Verification Gatekeeper Check */}
      {bookingTutorId && tutorToBook && (
        currentUser.verificationStatus === 'pending' || currentUser.verificationStatus === 'rejected' ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
            <div className="relative max-w-xl w-full">
              <button
                onClick={() => setBookingTutorId(null)}
                className="absolute right-4 top-4 z-10 p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 shadow transition"
              >
                <X className="w-5 h-5" />
              </button>
              <PRNVerificationGatekeeper currentUser={currentUser} featureName="Peer Tutoring Sessions" />
            </div>
          </div>
        ) : (
          <BookingModal
            tutor={tutorToBook.user}
            tutorProfile={tutorToBook.profile}
            slots={tutorToBook.slots}
            learner={currentUser}
            onConfirmBooking={handleConfirmBooking}
            onClose={() => setBookingTutorId(null)}
          />
        )
      )}

      {/* 3. Session Room Detail & Reflection Modal */}
      {activeSessionRoom && (
        <SessionRoomModal
          session={activeSessionRoom}
          currentUser={currentUser}
          learner={
            allUsers.find((u) => u.id === activeSessionRoom.learnerId) ||
            currentUser
          }
          tutor={
            allUsers.find((u) => u.id === activeSessionRoom.tutorId) ||
            allUsers[1]
          }
          review={reviews.find((r) => r.sessionId === activeSessionRoom.id)}
          onCompleteSession={handleCompleteSession}
          onSubmitReview={handleSubmitReview}
          onClose={() => setActiveSessionRoom(null)}
        />
      )}

      {/* 4. Tutor Application Modal */}
      <TutorApplicationModal
        currentUser={currentUser}
        isOpen={showTutorAppModal}
        onClose={() => setShowTutorAppModal(false)}
        onSubmitted={() => {
          syncFromStorage();
          alert('Your tutor application has been submitted and queued for administrative review.');
        }}
      />

      {/* 5. Level Up Celebratory Modal */}
      {levelUpData && (
        <LevelUpModal
          levelInfo={levelUpData.levelInfo}
          newXP={levelUpData.newXP}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {/* 6. Trust & Safety Confidential Report Modal */}
      <ReportModal
        isOpen={!!reportTarget}
        onClose={() => setReportTarget(null)}
        currentUser={currentUser}
        targetUser={reportTarget || undefined}
        onReportSubmitted={() => syncFromStorage()}
      />
    </div>
  );
}

export default App;
