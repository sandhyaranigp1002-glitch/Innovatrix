import {
  ActivityLog,
  ApprovedPRN,
  AuthSession,
  AvailabilitySlot,
  CollegeSecurityConfig,
  ContentReport,
  CreditTransaction,
  DailyQuest,
  DiagnosticQuiz,
  DiagnosticQuizResult,
  ExamRescuePlan,
  InAppNotification,
  LeaderboardEntry,
  LearningCircle,
  LearningScoreAssessment,
  SessionRequest,
  SessionReview,
  SkillTreeNode,
  StudentVerificationRequest,
  TeachingStyle,
  TutorApplication,
  TutorProfile,
  UserProfile,
  UserRole,
  VerificationStatus,
  WaitlistEntry,
} from '../types';
import { ALL_BADGES, calculateImpactScore, getLevelForXP } from './gamification';
import {
  DEFAULT_COLLEGE_CONFIG,
  maskPRN,
  validateCollegeEmail,
  validatePRNFormat,
} from './security';
import { DEFAULT_DIAGNOSTIC_QUIZZES } from './diagnosticData';
import {
  DEMO_SAMPLE_CIRCLES,
  DEMO_SAMPLE_CREDIT_TRANSACTIONS,
  DEMO_SAMPLE_DIAGNOSTIC_RESULTS,
  DEMO_SAMPLE_EXAM_RESCUE_PLANS,
  DEMO_SAMPLE_LEARNING_SCORES,
  DEMO_SAMPLE_SLOTS,
  DEMO_SAMPLE_TUTOR_APPLICATIONS,
  DEMO_SAMPLE_TUTOR_PROFILES,
  DEMO_SAMPLE_USERS,
  DEMO_SAMPLE_VERIFICATION_REQUESTS,
  DEMO_SAMPLE_WAITLIST,
} from './demoPresets';

const STORAGE_KEYS = {
  USERS: 'brainbridge_users_v5',
  CURRENT_USER_ID: 'brainbridge_current_user_id_v5',
  AUTH_SESSION: 'brainbridge_auth_session_v5',
  ACTIVITY_LOGS: 'brainbridge_activity_logs_v5',
  TUTOR_PROFILES: 'brainbridge_tutor_profiles_v5',
  SLOTS: 'brainbridge_slots_v5',
  SESSIONS: 'brainbridge_sessions_v5',
  REVIEWS: 'brainbridge_reviews_v5',
  QUESTS: 'brainbridge_quests_v5',
  SKILL_NODES: 'brainbridge_skill_nodes_v5',
  CIRCLES: 'brainbridge_circles_v5',
  NOTIFICATIONS: 'brainbridge_notifications_v5',
  REPORTS: 'brainbridge_reports_v5',
  APPROVED_PRNS: 'brainbridge_approved_prns_v5',
  VERIFICATION_REQUESTS: 'brainbridge_verification_requests_v5',
  TUTOR_APPLICATIONS: 'brainbridge_tutor_applications_v5',
  SECURITY_CONFIG: 'brainbridge_security_config_v5',
  CREDIT_TRANSACTIONS: 'brainbridge_credit_tx_v5',
  DIAGNOSTIC_RESULTS: 'brainbridge_diagnostic_results_v5',
  EXAM_RESCUE_PLANS: 'brainbridge_exam_rescue_plans_v5',
  LEARNING_SCORES: 'brainbridge_learning_scores_v5',
  WAITLIST: 'brainbridge_waitlist_v5',
  DEMO_MODE_ACTIVE: 'brainbridge_demo_mode_active_v5',
  THEME: 'brainbridge_theme_preference_v5',
};

// Seed Users — Baseline institutional administrator only (no fake accounts)
const SEED_USERS: UserProfile[] = [
  {
    id: 'user_admin',
    name: 'BrainBridge Administrator',
    email: 'admin@brainbridge.edu',
    password: 'admin123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80',
    role: 'admin',
    department: 'Faculty of Engineering & Computing',
    academicYear: 'Institutional Administrator',
    bio: 'BrainBridge System Administrator & Peer Learning Coordinator. Overseeing student verifications, PRN compliance, and certified campus mentors.',
    xp: 0,
    level: 1,
    levelTitle: 'Administrator',
    streakDays: 0,
    bestStreak: 0,
    lastActiveDate: new Date().toISOString().split('T')[0],
    impactScore: 0,
    verified: true,
    badges: [],
    status: 'active',
    prn: 'ADMIN-001',
    prnMasked: 'ADMIN-***-001',
    verificationStatus: 'approved',
    isTutorApproved: false,
    creditBalance: 100,
    languages: ['English', 'Hindi'],
    themePreference: 'light',
    optOutOfLeaderboard: false,
  },
];

// Clean empty collections (all fake data removed)
const SEED_APPROVED_PRNS: ApprovedPRN[] = [];
const SEED_VERIFICATION_REQUESTS: StudentVerificationRequest[] = [];
const SEED_TUTOR_APPLICATIONS: TutorApplication[] = [];

const SEED_ACTIVITY_LOGS: ActivityLog[] = [];
const SEED_TUTOR_PROFILES: TutorProfile[] = [];
const SEED_SLOTS: AvailabilitySlot[] = [];
const SEED_SESSIONS: SessionRequest[] = [];
const SEED_REVIEWS: SessionReview[] = [];

// Seed Daily Quests
const SEED_QUESTS: DailyQuest[] = [
  {
    id: 'quest_1',
    title: 'Find a Tutor for Your Target Subject',
    description: 'Use the Smart Matcher or browse tutor profiles to discover an engineering mentor.',
    xpReward: 35,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    questType: 'find_tutor',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'quest_2',
    title: 'Define a Clear Learning Objective',
    description: 'Submit or accept a session booking with a specific, measurable learning goal.',
    xpReward: 45,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    questType: 'send_goal',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'quest_3',
    title: 'Complete a Peer Tutoring Session',
    description: 'Wrap up a scheduled session, write learning takeaways, and submit constructive peer feedback.',
    xpReward: 60,
    targetCount: 1,
    currentCount: 0,
    isCompleted: false,
    isClaimed: false,
    questType: 'complete_session',
    date: new Date().toISOString().split('T')[0],
  },
];

// Seed Skill Tree
const SEED_SKILL_NODES: SkillTreeNode[] = [
  // Programming Path
  {
    id: 'node_prog_1',
    subject: 'Programming Fundamentals',
    title: 'C & Memory Basics',
    category: 'programming',
    level: 'Fundamental',
    icon: 'Cpu',
    prerequisites: [],
    isUnlocked: true,
    isCompleted: false,
    sessionsRequired: 1,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_c1', title: 'Pointers & Dynamic Memory Allocation', description: 'Master malloc, free, and pointer arithmetic', xpReward: 50, completed: false },
      { id: 'm_c2', title: 'Structs & File I/O', description: 'Create data structures and read/write binary files', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'node_prog_2',
    subject: 'Java & OOP Principles',
    title: 'Object-Oriented Architecture',
    category: 'programming',
    level: 'Intermediate',
    icon: 'Layers',
    prerequisites: ['node_prog_1'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_j1', title: 'Polymorphism & Abstract Interfaces', description: 'Write decoupled object hierarchies', xpReward: 50, completed: false },
      { id: 'm_j2', title: 'Generics & Java Collections Framework', description: 'Implement custom generic data structures', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'node_prog_3',
    subject: 'Python for Engineering',
    title: 'Python Data Pipelines',
    category: 'programming',
    level: 'Advanced',
    icon: 'Code2',
    prerequisites: ['node_prog_2'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_py1', title: 'Functional Generators & Decorators', description: 'Construct efficient memory-safe iterator streams', xpReward: 50, completed: false },
      { id: 'm_py2', title: 'Asynchronous Programming with asyncio', description: 'Handle concurrent networking queries', xpReward: 50, completed: false },
    ],
  },
  // Core CS Path
  {
    id: 'node_core_1',
    subject: 'Database Systems',
    title: 'Relational DBMS & SQL Mastery',
    category: 'core_cs',
    level: 'Fundamental',
    icon: 'Database',
    prerequisites: [],
    isUnlocked: true,
    isCompleted: false,
    sessionsRequired: 1,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_db1', title: 'Complex JOINs & Aggregate Queries', description: 'Construct multi-table analytical queries', xpReward: 50, completed: false },
      { id: 'm_db2', title: 'Database Normalization (1NF to BCNF)', description: 'Eliminate redundancy and update anomalies', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'node_core_2',
    subject: 'Operating Systems',
    title: 'Processes, Threads & Virtual Memory',
    category: 'core_cs',
    level: 'Intermediate',
    icon: 'Terminal',
    prerequisites: ['node_prog_1'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_os1', title: 'Concurrency, Mutexes & Semaphores', description: 'Prevent deadlocks and race conditions in C', xpReward: 50, completed: false },
      { id: 'm_os2', title: 'Page Replacement & Paging Tables', description: 'Trace LRU, FIFO and memory mapping routines', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'node_core_3',
    subject: 'Computer Networks',
    title: 'Socket Programming & TCP/IP',
    category: 'core_cs',
    level: 'Advanced',
    icon: 'Globe',
    prerequisites: ['node_core_2'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_net1', title: 'TCP 3-Way Handshake & Flow Control', description: 'Analyze Wireshark traces and congestion algorithms', xpReward: 50, completed: false },
      { id: 'm_net2', title: 'Custom Client-Server Socket Protocol', description: 'Build an encrypted chat protocol', xpReward: 50, completed: false },
    ],
  },
  // Problem Solving
  {
    id: 'node_prob_1',
    subject: 'Data Structures & Algorithms',
    title: 'Linear Structures & Binary Search',
    category: 'problem_solving',
    level: 'Fundamental',
    icon: 'Binary',
    prerequisites: [],
    isUnlocked: true,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_dsa1', title: 'Linked Lists & Two Pointers Method', description: 'Solve cycle detection and list reversal', xpReward: 50, completed: false },
      { id: 'm_dsa2', title: 'Binary Search & Monotonic Predicates', description: 'Apply log(N) bounds on rotated sorted spaces', xpReward: 50, completed: false },
    ],
  },
  {
    id: 'node_prob_2',
    subject: 'Trees & Graph Algorithms',
    title: 'DFS, BFS & Shortest Paths',
    category: 'problem_solving',
    level: 'Intermediate',
    icon: 'GitFork',
    prerequisites: ['node_prob_1'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_graph1', title: 'Dijkstra & Topological Sort', description: 'Find shortest paths and cycle dependencies in DAGs', xpReward: 50, completed: false },
      { id: 'm_graph2', title: 'Disjoint Set Union (DSU) & Kruskal', description: 'Construct Minimum Spanning Trees', xpReward: 50, completed: false },
    ],
  },
  // Emerging Tech
  {
    id: 'node_tech_1',
    subject: 'AI & Machine Learning',
    title: 'Mathematical Foundations for ML',
    category: 'emerging_tech',
    level: 'Intermediate',
    icon: 'BrainCircuit',
    prerequisites: ['node_prog_1'],
    isUnlocked: false,
    isCompleted: false,
    sessionsRequired: 2,
    sessionsCompleted: 0,
    milestones: [
      { id: 'm_ml1', title: 'Vector Spaces & Matrix Decompositions', description: 'Compute Eigenvalues and SVD for PCA', xpReward: 50, completed: false },
      { id: 'm_ml2', title: 'Gradient Descent Optimization', description: 'Derive cost function gradients from scratch', xpReward: 50, completed: false },
    ],
  },
];

const SEED_CIRCLES: LearningCircle[] = [];
const SEED_NOTIFICATIONS: InAppNotification[] = [];
const SEED_REPORTS: ContentReport[] = [];

// In-memory fallback store for SSR and automated testing environments
const memoryFallbackStore: Record<string, string> = {};

function getStorageInstance() {
  try {
    if (typeof window !== 'undefined' && window.localStorage && typeof window.localStorage.getItem === 'function') {
      return window.localStorage;
    }
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage;
    }
  } catch {
    // Fall back to memory store if localStorage is restricted
  }
  return {
    getItem: (key: string) => (memoryFallbackStore[key] !== undefined ? memoryFallbackStore[key] : null),
    setItem: (key: string, value: string) => { memoryFallbackStore[key] = String(value); },
    removeItem: (key: string) => { delete memoryFallbackStore[key]; },
    clear: () => { Object.keys(memoryFallbackStore).forEach((k) => delete memoryFallbackStore[k]); },
  };
}

// Storage Helper Functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const storage = getStorageInstance();
    const item = storage.getItem(key);
    if (!item) {
      storage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (e) {
    console.error(`Error reading from storage key "${key}":`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    const storage = getStorageInstance();
    storage.setItem(key, JSON.stringify(value));
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('brainbridge-storage-update', { detail: { key } }));
    }
  } catch (e) {
    console.error(`Error saving to storage key "${key}":`, e);
  }
}

export class LocalStorageAdapter {
  static init(): void {
    // Ensure all seed data exists
    getFromStorage(STORAGE_KEYS.USERS, SEED_USERS);
    getFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_admin');
    getFromStorage(STORAGE_KEYS.TUTOR_PROFILES, SEED_TUTOR_PROFILES);
    getFromStorage(STORAGE_KEYS.SLOTS, SEED_SLOTS);
    getFromStorage(STORAGE_KEYS.SESSIONS, SEED_SESSIONS);
    getFromStorage(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
    getFromStorage(STORAGE_KEYS.QUESTS, SEED_QUESTS);
    getFromStorage(STORAGE_KEYS.SKILL_NODES, SEED_SKILL_NODES);
    getFromStorage(STORAGE_KEYS.CIRCLES, SEED_CIRCLES);
    getFromStorage(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    getFromStorage(STORAGE_KEYS.REPORTS, SEED_REPORTS);
    getFromStorage(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
    getFromStorage(STORAGE_KEYS.APPROVED_PRNS, SEED_APPROVED_PRNS);
    getFromStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, SEED_VERIFICATION_REQUESTS);
    getFromStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, SEED_TUTOR_APPLICATIONS);
    getFromStorage(STORAGE_KEYS.SECURITY_CONFIG, DEFAULT_COLLEGE_CONFIG);
    getFromStorage(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
    getFromStorage(STORAGE_KEYS.DIAGNOSTIC_RESULTS, []);
    getFromStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, []);
    getFromStorage(STORAGE_KEYS.LEARNING_SCORES, []);
    getFromStorage(STORAGE_KEYS.WAITLIST, []);
    getFromStorage(STORAGE_KEYS.DEMO_MODE_ACTIVE, false);
    getFromStorage(STORAGE_KEYS.THEME, 'light');
  }

  static resetAllData(): void {
    const storage = getStorageInstance();
    storage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    storage.setItem(STORAGE_KEYS.CURRENT_USER_ID, JSON.stringify('user_admin'));
    storage.setItem(STORAGE_KEYS.TUTOR_PROFILES, JSON.stringify(SEED_TUTOR_PROFILES));
    storage.setItem(STORAGE_KEYS.SLOTS, JSON.stringify(SEED_SLOTS));
    storage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(SEED_SESSIONS));
    storage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    storage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(SEED_QUESTS));
    storage.setItem(STORAGE_KEYS.SKILL_NODES, JSON.stringify(SEED_SKILL_NODES));
    storage.setItem(STORAGE_KEYS.CIRCLES, JSON.stringify(SEED_CIRCLES));
    storage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(SEED_NOTIFICATIONS));
    storage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(SEED_REPORTS));
    storage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(SEED_ACTIVITY_LOGS));
    storage.setItem(STORAGE_KEYS.APPROVED_PRNS, JSON.stringify(SEED_APPROVED_PRNS));
    storage.setItem(STORAGE_KEYS.VERIFICATION_REQUESTS, JSON.stringify(SEED_VERIFICATION_REQUESTS));
    storage.setItem(STORAGE_KEYS.TUTOR_APPLICATIONS, JSON.stringify(SEED_TUTOR_APPLICATIONS));
    storage.setItem(STORAGE_KEYS.SECURITY_CONFIG, JSON.stringify(DEFAULT_COLLEGE_CONFIG));
    storage.setItem(STORAGE_KEYS.CREDIT_TRANSACTIONS, JSON.stringify([]));
    storage.setItem(STORAGE_KEYS.DIAGNOSTIC_RESULTS, JSON.stringify([]));
    storage.setItem(STORAGE_KEYS.EXAM_RESCUE_PLANS, JSON.stringify([]));
    storage.setItem(STORAGE_KEYS.LEARNING_SCORES, JSON.stringify([]));
    storage.setItem(STORAGE_KEYS.WAITLIST, JSON.stringify([]));
    storage.setItem(STORAGE_KEYS.DEMO_MODE_ACTIVE, JSON.stringify(false));
    storage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('brainbridge-storage-update', { detail: { key: 'all' } }));
    }
  }

  // Security Configuration
  static getSecurityConfig(): CollegeSecurityConfig {
    return getFromStorage<CollegeSecurityConfig>(STORAGE_KEYS.SECURITY_CONFIG, DEFAULT_COLLEGE_CONFIG);
  }

  static updateSecurityConfig(configUpdates: Partial<CollegeSecurityConfig>): void {
    const config = { ...this.getSecurityConfig(), ...configUpdates };
    saveToStorage(STORAGE_KEYS.SECURITY_CONFIG, config);
    this.logActivity('College Security Settings Updated', 'Admin updated PRN format rules and verification policies');
  }

  // Approved PRN Roster Management
  static getApprovedPRNs(): ApprovedPRN[] {
    return getFromStorage<ApprovedPRN[]>(STORAGE_KEYS.APPROVED_PRNS, SEED_APPROVED_PRNS);
  }

  static addApprovedPRN(data: {
    prn: string;
    studentName: string;
    email: string;
    department: string;
    academicYear: string;
  }): ApprovedPRN {
    if (this.getCurrentUser().role !== 'admin') {
      throw new Error('Access Denied: Only administrators can modify the approved PRN roster.');
    }
    const cleanPRN = data.prn.trim().toUpperCase();
    const config = this.getSecurityConfig();
    const check = validatePRNFormat(cleanPRN, config);
    if (!check.valid) {
      throw new Error(check.error || 'Invalid PRN format according to college rules.');
    }

    const roster = this.getApprovedPRNs();
    if (roster.some((p) => p.prn.toUpperCase() === cleanPRN)) {
      throw new Error(`PRN ${maskPRN(cleanPRN)} is already present in the approved roster.`);
    }

    const newEntry: ApprovedPRN = {
      id: `prn_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      prn: cleanPRN,
      prnMasked: maskPRN(cleanPRN),
      studentName: data.studentName.trim(),
      email: data.email.trim().toLowerCase(),
      department: data.department,
      academicYear: data.academicYear,
      isRegistered: false,
      createdAt: new Date().toISOString(),
    };

    roster.unshift(newEntry);
    saveToStorage(STORAGE_KEYS.APPROVED_PRNS, roster);
    this.logActivity('Approved PRN Added', `Added ${newEntry.studentName} (${newEntry.prnMasked}) to official roster`);
    return newEntry;
  }

  static importApprovedPRNs(
    prnList: { prn: string; studentName: string; email: string; department: string; academicYear: string }[]
  ): number {
    let successCount = 0;
    for (const item of prnList) {
      try {
        this.addApprovedPRN(item);
        successCount++;
      } catch {
        // Skip duplicate or invalid entries in batch import
      }
    }
    return successCount;
  }

  // Student Verification Requests Queue
  static getVerificationRequests(): StudentVerificationRequest[] {
    return getFromStorage<StudentVerificationRequest[]>(
      STORAGE_KEYS.VERIFICATION_REQUESTS,
      SEED_VERIFICATION_REQUESTS
    );
  }

  static submitVerificationRequest(
    req: Omit<StudentVerificationRequest, 'id' | 'submittedAt' | 'status'>
  ): StudentVerificationRequest {
    const requests = this.getVerificationRequests();
    const newReq: StudentVerificationRequest = {
      ...req,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    requests.unshift(newReq);
    saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);
    return newReq;
  }

  static approveStudentVerification(requestId: string): void {
    if (this.getCurrentUser().role !== 'admin') {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const requests = this.getVerificationRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = 'approved';
    req.reviewedAt = new Date().toISOString();
    const admin = this.getCurrentUser();
    req.reviewedBy = admin.name;
    saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);

    // Update user profile
    const users = this.getUsers();
    const user = users.find((u) => u.id === req.userId);
    if (user) {
      user.verificationStatus = 'approved';
      user.verified = true;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }

    // Update approved PRN roster if present
    const roster = this.getApprovedPRNs();
    const matching = roster.find((p) => p.prn.toUpperCase() === req.prn.toUpperCase());
    if (matching) {
      matching.isRegistered = true;
      matching.registeredUserId = req.userId;
      saveToStorage(STORAGE_KEYS.APPROVED_PRNS, roster);
    }

    this.logActivity(
      'Student PRN Verification Approved',
      `Admin approved PRN ${maskPRN(req.prn)} for ${req.studentName}`
    );
    this.addNotification({
      userId: req.userId,
      title: '✅ PRN Verification Approved!',
      message: 'Your Permanent Registration Number has been verified by college administration. All BrainBridge features are now active.',
      type: 'request_accepted',
    });
  }

  static rejectStudentVerification(requestId: string, reason: string): void {
    if (this.getCurrentUser().role !== 'admin') {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const requests = this.getVerificationRequests();
    const req = requests.find((r) => r.id === requestId);
    if (!req) return;

    req.status = 'rejected';
    req.rejectionReason = reason;
    req.reviewedAt = new Date().toISOString();
    const admin = this.getCurrentUser();
    req.reviewedBy = admin.name;
    saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, requests);

    // Update user profile
    const users = this.getUsers();
    const user = users.find((u) => u.id === req.userId);
    if (user) {
      user.verificationStatus = 'rejected';
      user.rejectionReason = reason;
      user.verified = false;
      saveToStorage(STORAGE_KEYS.USERS, users);
    }

    this.logActivity(
      'Student PRN Verification Rejected',
      `Admin rejected PRN verification for ${req.studentName}. Reason: ${reason}`
    );
    this.addNotification({
      userId: req.userId,
      title: 'PRN Verification Declined',
      message: `Your student verification could not be approved. Reason: ${reason}`,
      type: 'request_declined',
    });
  }

  // Tutor Applications Queue
  static getTutorApplications(): TutorApplication[] {
    return getFromStorage<TutorApplication[]>(
      STORAGE_KEYS.TUTOR_APPLICATIONS,
      SEED_TUTOR_APPLICATIONS
    );
  }

  static submitTutorApplication(data: {
    userId: string;
    subjects: string[];
    expertiseSummary: string;
    teachingStyle: TeachingStyle;
    hourlyCredits: number;
  }): TutorApplication {
    const users = this.getUsers();
    const user = users.find((u) => u.id === data.userId);
    if (!user) throw new Error('Student account not found.');

    if (user.verificationStatus !== 'approved') {
      throw new Error(
        'Identity Verification Required: Only students with approved PRN credentials can apply to become tutors.'
      );
    }

    const apps = this.getTutorApplications();
    const existing = apps.find(
      (a) => a.userId === data.userId && a.status === 'pending'
    );
    if (existing) {
      throw new Error('You already have a tutor application pending administrative review.');
    }

    const newApp: TutorApplication = {
      id: `tapp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: user.id,
      studentName: user.name,
      email: user.email,
      department: user.department,
      subjects: data.subjects,
      expertiseSummary: data.expertiseSummary,
      teachingStyle: data.teachingStyle,
      hourlyCredits: data.hourlyCredits || 1,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    apps.unshift(newApp);
    saveToStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, apps);

    this.logActivity(
      'Tutor Application Submitted',
      `${user.name} applied to tutor: ${data.subjects.join(', ')}`,
      user.id
    );
    this.addNotification({
      userId: user.id,
      title: 'Tutor Application Received',
      message: 'Your tutor application has been queued for faculty review. You will be notified once evaluated.',
      type: 'request_new',
    });

    return newApp;
  }

  static approveTutorApplication(applicationId: string): void {
    if (this.getCurrentUser().role !== 'admin') {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const apps = this.getTutorApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) return;

    app.status = 'approved';
    app.reviewedAt = new Date().toISOString();
    const admin = this.getCurrentUser();
    app.reviewedBy = admin.name;
    saveToStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, apps);

    // Promote student to tutor role
    const users = this.getUsers();
    const user = users.find((u) => u.id === app.userId);
    if (user) {
      user.role = 'tutor';
      user.isTutorApproved = true;
      user.verified = true;
      saveToStorage(STORAGE_KEYS.USERS, users);

      // Create or update TutorProfile
      const profiles = this.getTutorProfiles();
      let prof = profiles.find((p) => p.userId === user.id);
      if (!prof) {
        prof = {
          userId: user.id,
          subjects: app.subjects.map((s, idx) => ({
            id: `sub_${Date.now()}_${idx}`,
            subject: s,
            skillLevel: 'Advanced',
            experienceYears: 1,
            hourlyCredits: app.hourlyCredits,
          })),
          teachingModes: ['online', 'in_person'],
          teachingStyle: app.teachingStyle,
          rating: 5.0,
          reviewCount: 0,
          locationPreference: 'Campus Library Level 2 or Google Meet',
          verified: true,
        };
        profiles.push(prof);
      } else {
        prof.verified = true;
      }
      saveToStorage(STORAGE_KEYS.TUTOR_PROFILES, profiles);
    }

    this.logActivity(
      'Tutor Application Approved',
      `Promoted ${app.studentName} to certified Peer Tutor for ${app.subjects.join(', ')}`
    );
    this.addNotification({
      userId: app.userId,
      title: '🎉 Tutor Application Approved!',
      message: 'Congratulations! Campus administration has certified your tutor profile. Your Tutor Studio is now active.',
      type: 'badge_unlocked',
    });
  }

  static rejectTutorApplication(applicationId: string, reason: string): void {
    if (this.getCurrentUser().role !== 'admin') {
      throw new Error('Access Denied: Administrator privileges required.');
    }
    const apps = this.getTutorApplications();
    const app = apps.find((a) => a.id === applicationId);
    if (!app) return;

    app.status = 'rejected';
    app.rejectionReason = reason;
    app.reviewedAt = new Date().toISOString();
    const admin = this.getCurrentUser();
    app.reviewedBy = admin.name;
    saveToStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, apps);

    this.logActivity(
      'Tutor Application Rejected',
      `Rejected tutor application for ${app.studentName}. Reason: ${reason}`
    );
    this.addNotification({
      userId: app.userId,
      title: 'Tutor Application Update',
      message: `Your tutor application was not approved at this time. Reason: ${reason}`,
      type: 'request_declined',
    });
  }

  // Authentication & Session Management
  static getAuthSession(): AuthSession | null {
    try {
      const item = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
      return item ? (JSON.parse(item) as AuthSession) : null;
    } catch {
      return null;
    }
  }

  static setAuthSession(session: AuthSession): void {
    saveToStorage(STORAGE_KEYS.AUTH_SESSION, session);
    this.setCurrentUserId(session.userId);
  }

  static clearAuthSession(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
      if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
        window.dispatchEvent(new CustomEvent('brainbridge-storage-update', { detail: { key: 'auth' } }));
      }
    } catch (e) {
      console.error(e);
    }
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getAuthSession()?.userId);
  }

  static login(
    email: string,
    password?: string,
    requestedRole?: UserRole
  ): { user: UserProfile; session: AuthSession } {
    const trimmedEmail = email.trim().toLowerCase();
    const users = this.getUsers();

    // Map administrator access or search registered user accounts
    let targetUser: UserProfile | undefined;
    if (
      trimmedEmail === 'admin@brainbridge.edu' ||
      (requestedRole === 'admin' && (trimmedEmail === 'admin' || trimmedEmail === 'moderator@brainbridge.edu'))
    ) {
      targetUser = users.find((u) => u.id === 'user_admin' || u.role === 'admin');
    } else {
      targetUser = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    }

    if (!targetUser) {
      throw new Error(`No account found for "${email}". Please register first or check your credentials.`);
    }

    if (targetUser.status === 'suspended') {
      throw new Error('This account has been suspended by campus moderators.');
    }

    if (requestedRole && targetUser.role !== requestedRole) {
      const roleDisplay = targetUser.role === 'learner' ? 'Student' : targetUser.role === 'tutor' ? 'Tutor' : 'Admin';
      throw new Error(`This email belongs to a ${roleDisplay} account. Please select the ${roleDisplay} card to sign in.`);
    }

    const expected = targetUser.password || 'admin123';
    if (password && password !== expected) {
      throw new Error('Incorrect password. Please verify your credentials.');
    }

    const session: AuthSession = {
      userId: targetUser.id,
      role: targetUser.role,
      token: `brainbridge-jwt-${targetUser.id}-${Date.now()}`,
      loginTime: new Date().toISOString(),
    };

    this.setAuthSession(session);
    this.logActivity('User Sign In', `${targetUser.name} signed in as ${targetUser.role.toUpperCase()}`, targetUser.id);

    return { user: targetUser, session };
  }

  static register(data: {
    name: string;
    email: string;
    password?: string;
    prn: string;
    department: string;
    academicYear: string;
    bio?: string;
  }): { user: UserProfile; session: AuthSession; message: string } {
    const users = this.getUsers();
    const trimmedEmail = data.email.trim().toLowerCase();
    const cleanPRN = data.prn.trim().toUpperCase();
    const config = this.getSecurityConfig();

    // 1. Mandatory PRN and format check
    const prnCheck = validatePRNFormat(cleanPRN, config);
    if (!prnCheck.valid) {
      throw new Error(prnCheck.error || 'Invalid PRN format according to college configuration.');
    }

    // 2. Validate email address format (all valid email IDs accepted)
    const emailCheck = validateCollegeEmail(trimmedEmail, config.allowedEmailDomain);
    if (!emailCheck.valid) {
      throw new Error(emailCheck.error || 'Please enter a valid email address.');
    }

    // 3. Prevent duplicate email registrations
    const existingEmail = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingEmail) {
      throw new Error('An account with this email address already exists.');
    }

    // 4. Prevent duplicate PRN registrations (PRN uniqueness)
    const existingPRN = users.find((u) => u.prn && u.prn.trim().toUpperCase() === cleanPRN);
    if (existingPRN) {
      throw new Error(
        `PRN "${maskPRN(cleanPRN)}" is already registered with an existing student account. Multiple accounts cannot register with the same PRN.`
      );
    }

    // 5. Verification against approved PRN roster
    const roster = this.getApprovedPRNs();
    const rosterMatch = roster.find((p) => p.prn.toUpperCase() === cleanPRN);
    if (rosterMatch && rosterMatch.isRegistered && rosterMatch.registeredUserId) {
      throw new Error(`PRN "${maskPRN(cleanPRN)}" has already been claimed by another student account.`);
    }

    const newId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;

    // Prompt rule: "Do not treat a correctly formatted PRN as proof of student identity. Keep new accounts in a Pending Verification state until the PRN and required college details are verified."
    const newUser: UserProfile = {
      id: newId,
      name: data.name.trim(),
      email: trimmedEmail,
      password: data.password || 'student123',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
      role: 'learner', // Strictly student; users cannot self-grant Tutor or Admin role!
      department: data.department || 'Computer Science',
      academicYear: data.academicYear || 'Sophomore (2nd Year)',
      bio: data.bio || 'Student eager to connect and level up through peer tutoring.',
      xp: 100,
      level: 1,
      levelTitle: 'Beginner',
      streakDays: 1,
      bestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      impactScore: 15,
      verified: false,
      badges: ['first_step'],
      status: 'active',
      prn: cleanPRN,
      prnMasked: maskPRN(cleanPRN),
      verificationStatus: 'pending',
      isTutorApproved: false,
      creditBalance: 10,
      languages: ['English'],
      themePreference: 'light',
      optOutOfLeaderboard: false,
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.USERS, users);

    this.addCreditTransaction({
      userId: newId,
      type: 'bonus',
      amount: 10,
      description: 'Welcome Bonus: 10 Learning Credits on Student Registration',
    });

    if (rosterMatch) {
      rosterMatch.isRegistered = true;
      rosterMatch.registeredUserId = newId;
      saveToStorage(STORAGE_KEYS.APPROVED_PRNS, roster);
    }

    // Create a verification request in the Admin review queue
    this.submitVerificationRequest({
      userId: newId,
      studentName: newUser.name,
      email: newUser.email,
      department: newUser.department,
      academicYear: newUser.academicYear,
      prn: cleanPRN,
      prnMasked: newUser.prnMasked || maskPRN(cleanPRN),
    });

    const session: AuthSession = {
      userId: newUser.id,
      role: newUser.role,
      token: `brainbridge-jwt-${newUser.id}-${Date.now()}`,
      loginTime: new Date().toISOString(),
    };

    this.setAuthSession(session);
    this.logActivity(
      'Student Registration (Pending PRN Verification)',
      `${newUser.name} registered with PRN ${newUser.prnMasked}`,
      newUser.id
    );

    return {
      user: newUser,
      session,
      message: 'Registration submitted! Your PRN is pending official college verification before full access is unlocked.',
    };
  }

  static logout(): void {
    const current = this.getCurrentUser();
    this.logActivity('User Sign Out', `${current.name} signed out`, current.id);
    this.clearAuthSession();
  }

  // Activity Logs
  static getActivityLogs(): ActivityLog[] {
    return getFromStorage<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, SEED_ACTIVITY_LOGS);
  }

  static logActivity(action: string, details: string, actorId?: string): void {
    const logs = this.getActivityLogs();
    const user = actorId ? this.getUsers().find((u) => u.id === actorId) : this.getCurrentUser();
    const newLog: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      actorId: user?.id || 'system',
      actorName: user?.name || 'System',
      actorRole: user?.role || 'admin',
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    if (logs.length > 50) logs.pop();
    saveToStorage(STORAGE_KEYS.ACTIVITY_LOGS, logs);
  }

  // Admin user moderation
  static toggleUserStatus(userId: string): 'active' | 'suspended' {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return 'active';
    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    saveToStorage(STORAGE_KEYS.USERS, users);
    this.logActivity('User Status Toggled', `${user.name} status changed to ${user.status.toUpperCase()}`);
    return user.status;
  }

  static toggleUserVerification(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;
    user.verified = !user.verified;
    saveToStorage(STORAGE_KEYS.USERS, users);
    this.logActivity('User Verification Toggled', `${user.name} verified status set to ${user.verified}`);
    return user.verified;
  }

  static deleteUser(userId: string): void {
    let users = this.getUsers();
    const userToDelete = users.find((u) => u.id === userId);
    users = users.filter((u) => u.id !== userId);
    saveToStorage(STORAGE_KEYS.USERS, users);
    if (userToDelete) {
      this.logActivity('User Deleted', `Account of ${userToDelete.name} was removed by admin`);
    }
  }

  // Current User
  static getCurrentUserId(): string {
    return getFromStorage(STORAGE_KEYS.CURRENT_USER_ID, 'user_admin');
  }

  static setCurrentUserId(userId: string): void {
    saveToStorage(STORAGE_KEYS.CURRENT_USER_ID, userId);
  }

  static getCurrentUser(): UserProfile {
    const id = this.getCurrentUserId();
    const users = this.getUsers();
    return users.find((u) => u.id === id) || users[0];
  }

  static getUsers(): UserProfile[] {
    return getFromStorage<UserProfile[]>(STORAGE_KEYS.USERS, SEED_USERS);
  }

  static saveUsers(users: UserProfile[]): void {
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  static getUserProfile(userId: string): UserProfile | undefined {
    return this.getUsers().find((u) => u.id === userId);
  }

  static updateUser(user: UserProfile): void {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = user;
    } else {
      users.push(user);
    }
    saveToStorage(STORAGE_KEYS.USERS, users);
  }

  // Tutors
  static getTutorProfiles(): TutorProfile[] {
    return getFromStorage<TutorProfile[]>(STORAGE_KEYS.TUTOR_PROFILES, SEED_TUTOR_PROFILES);
  }

  static getTutorProfile(userId: string): TutorProfile | undefined {
    return this.getTutorProfiles().find((p) => p.userId === userId);
  }

  static updateTutorProfile(profile: TutorProfile): void {
    const profiles = this.getTutorProfiles();
    const idx = profiles.findIndex((p) => p.userId === profile.userId);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    saveToStorage(STORAGE_KEYS.TUTOR_PROFILES, profiles);
  }

  // Slots
  static getSlots(): AvailabilitySlot[] {
    return getFromStorage<AvailabilitySlot[]>(STORAGE_KEYS.SLOTS, SEED_SLOTS);
  }

  static getTutorSlots(tutorId: string): AvailabilitySlot[] {
    return this.getSlots().filter((s) => s.tutorId === tutorId);
  }

  static addSlot(slot: Omit<AvailabilitySlot, 'id'>): AvailabilitySlot {
    const tutor = this.getUsers().find((u) => u.id === slot.tutorId);
    if (tutor && tutor.isTutorApproved === false) {
      throw new Error(
        'Access Denied: Only certified and approved peer tutors can publish availability slots.'
      );
    }
    const slots = this.getSlots();
    const newSlot: AvailabilitySlot = {
      ...slot,
      id: `slot_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    };
    slots.push(newSlot);
    saveToStorage(STORAGE_KEYS.SLOTS, slots);
    return newSlot;
  }

  static deleteSlot(slotId: string): void {
    const slots = this.getSlots().filter((s) => s.id !== slotId);
    saveToStorage(STORAGE_KEYS.SLOTS, slots);
  }

  static setSlotBooked(slotId: string, isBooked: boolean): void {
    const slots = this.getSlots();
    const slot = slots.find((s) => s.id === slotId);
    if (slot) {
      slot.isBooked = isBooked;
      saveToStorage(STORAGE_KEYS.SLOTS, slots);
    }
  }

  // Sessions
  static getSessions(): SessionRequest[] {
    return getFromStorage<SessionRequest[]>(STORAGE_KEYS.SESSIONS, SEED_SESSIONS);
  }

  static createSessionRequest(request: Omit<SessionRequest, 'id' | 'createdAt' | 'status'>): SessionRequest {
    const learner = this.getUsers().find((u) => u.id === request.learnerId);
    if (learner && learner.verificationStatus === 'pending') {
      throw new Error(
        'Verification Required: Your PRN is awaiting administrative verification. You cannot book tutoring sessions until your student status is verified.'
      );
    }
    if (learner && learner.verificationStatus === 'rejected') {
      throw new Error(
        'Verification Rejected: Your student PRN verification was declined by campus administration. Please contact registrar staff.'
      );
    }

    const sessions = this.getSessions();
    const newSession: SessionRequest = {
      ...request,
      id: `sess_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    sessions.push(newSession);
    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

    // Also mark slot temporarily as pending/booked so other students can't collide
    this.setSlotBooked(request.slotId, true);

    // Deduct 1 credit from learner if account initialized
    if (learner && learner.creditBalance !== undefined) {
      this.addCreditTransaction({
        userId: learner.id,
        type: 'spent',
        amount: 1,
        description: `Booked tutoring session for ${request.subject}`,
        relatedSessionId: newSession.id,
      });
    }

    // Notify tutor
    this.addNotification({
      userId: request.tutorId,
      title: 'New Tutoring Request',
      message: `${learner?.name || 'A student'} requested a session on ${request.subject} for ${request.date} at ${request.startTime}.`,
      type: 'request_new',
      relatedId: newSession.id,
    });

    // Check Daily Quest 2: "Define a Clear Learning Objective"
    if (request.learningGoal && request.learningGoal.trim().length > 10) {
      this.incrementQuestProgress('send_goal');
    }

    return newSession;
  }

  static updateSessionStatus(sessionId: string, status: SessionRequest['status'], notes?: string): SessionRequest | null {
    const sessions = this.getSessions();
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    if (status === 'accepted') {
      const tutor = this.getUsers().find((u) => u.id === session.tutorId);
      if (tutor && tutor.isTutorApproved === false) {
        throw new Error('Unauthorized: Unapproved tutors cannot accept session requests.');
      }
    }

    session.status = status;
    if (notes) session.notes = notes;
    if (status === 'completed') {
      session.completedAt = new Date().toISOString();
      this.awardXP(session.tutorId, 60, `Completed Tutoring Session: ${session.subject}`);
      this.awardXP(session.learnerId, 40, `Participated in Tutoring Session: ${session.subject}`);
      this.addCreditTransaction({
        userId: session.tutorId,
        type: 'earned',
        amount: 2,
        description: `Taught peer session on ${session.subject}`,
        relatedSessionId: session.id,
      });
    }

    // If cancelled or declined, release slot & refund credit!
    if (status === 'declined' || status === 'cancelled') {
      this.setSlotBooked(session.slotId, false);
      this.addCreditTransaction({
        userId: session.learnerId,
        type: 'refunded',
        amount: 1,
        description: `Refund for ${status} session on ${session.subject}`,
        relatedSessionId: session.id,
      });
    }

    saveToStorage(STORAGE_KEYS.SESSIONS, sessions);

    // Notify learner
    const tutor = this.getUsers().find((u) => u.id === session.tutorId);
    const tutorName = tutor?.name || 'Your tutor';

    if (status === 'accepted') {
      this.addNotification({
        userId: session.learnerId,
        title: 'Session Request Accepted!',
        message: `${tutorName} accepted your session on ${session.subject} for ${session.date} at ${session.startTime}.`,
        type: 'request_accepted',
        relatedId: session.id,
      });
    } else if (status === 'declined') {
      this.addNotification({
        userId: session.learnerId,
        title: 'Session Request Declined',
        message: `${tutorName} was unable to accept your request for ${session.date}. The time slot has been released.`,
        type: 'request_declined',
        relatedId: session.id,
      });
    } else if (status === 'completed') {
      this.addNotification({
        userId: session.learnerId,
        title: 'Session Completed! 🎉',
        message: `Your session on ${session.subject} has been marked completed. Take your post-session mastery check and earn XP!`,
        type: 'session_completed',
        relatedId: session.id,
      });
    }

    return session;
  }

  // Reviews
  static getReviews(): SessionReview[] {
    return getFromStorage<SessionReview[]>(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
  }

  static addReview(review: Omit<SessionReview, 'id' | 'createdAt'>): SessionReview {
    const reviews = this.getReviews();
    const newReview: SessionReview = {
      ...review,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    reviews.push(newReview);
    saveToStorage(STORAGE_KEYS.REVIEWS, reviews);

    // Recalculate tutor rating
    const tutorReviews = reviews.filter((r) => r.tutorId === review.tutorId);
    const avgRating = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
    const tutorProfile = this.getTutorProfile(review.tutorId);
    if (tutorProfile) {
      tutorProfile.rating = Math.round(avgRating * 10) / 10;
      tutorProfile.reviewCount = tutorReviews.length;
      this.updateTutorProfile(tutorProfile);
    }

    // Award XP to learner for posting review (+25 XP)
    this.awardXP(review.learnerId, 25, 'Constructive peer review submitted');

    // If 5 stars, award tutor bonus (+40 XP)
    if (review.rating >= 5) {
      this.awardXP(review.tutorId, 40, 'Received 5-star peer review rating');
    }

    return newReview;
  }

  // XP and Badges
  static awardXP(userId: string, amount: number, reason: string): { newXP: number; leveledUp: boolean; newLevelTitle: string } {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return { newXP: 0, leveledUp: false, newLevelTitle: '' };

    const oldLevel = user.level;
    user.xp += amount;

    const levelInfo = getLevelForXP(user.xp);
    const leveledUp = levelInfo.level > oldLevel;
    user.level = levelInfo.level;
    user.levelTitle = levelInfo.title;

    // Recalculate impact score
    this.refreshUserImpactScore(user);

    this.updateUser(user);

    // If leveled up, notify
    if (leveledUp) {
      this.addNotification({
        userId: user.id,
        title: `Level Up! You are now a ${levelInfo.title}!`,
        message: `Congratulations! You reached Level ${levelInfo.level} (${levelInfo.title}) with ${user.xp} XP!`,
        type: 'level_up',
      });
      // Check level up badge
      if (levelInfo.level >= 3) {
        this.unlockBadge(user.id, 'level_up');
      }
    }

    return { newXP: user.xp, leveledUp, newLevelTitle: levelInfo.title };
  }

  static unlockBadge(userId: string, badgeId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (!user) return false;

    if (!user.badges.includes(badgeId)) {
      user.badges.push(badgeId);
      const badge = ALL_BADGES.find((b) => b.id === badgeId);
      if (badge) {
        user.xp += badge.xpReward;
        const levelInfo = getLevelForXP(user.xp);
        user.level = levelInfo.level;
        user.levelTitle = levelInfo.title;
        this.updateUser(user);

        this.addNotification({
          userId: user.id,
          title: `Badge Unlocked: ${badge.name}!`,
          message: `${badge.description} (+${badge.xpReward} XP awarded)`,
          type: 'badge_unlocked',
        });
      }
      return true;
    }
    return false;
  }

  static refreshUserImpactScore(user: UserProfile): void {
    const sessions = this.getSessions().filter((s) => s.status === 'completed');
    const userSessions = sessions.filter((s) => s.learnerId === user.id || s.tutorId === user.id);
    const uniqueStudents = new Set<string>();
    const subjects = new Set<string>();

    for (const s of userSessions) {
      subjects.add(s.subject);
      if (s.tutorId === user.id) {
        uniqueStudents.add(s.learnerId);
      }
    }

    const reviews = this.getReviews().filter((r) => r.tutorId === user.id && r.rating >= 4);

    const impact = calculateImpactScore({
      sessionsCompleted: userSessions.length,
      uniqueStudentsHelped: uniqueStudents.size,
      distinctSubjects: subjects.size,
      positiveReviewsCount: reviews.length,
    });

    user.impactScore = impact.score;
  }

  // Quests
  static getQuests(): DailyQuest[] {
    return getFromStorage<DailyQuest[]>(STORAGE_KEYS.QUESTS, SEED_QUESTS);
  }

  static incrementQuestProgress(questType: DailyQuest['questType']): void {
    const quests = this.getQuests();
    let changed = false;
    for (const q of quests) {
      if (q.questType === questType && !q.isCompleted) {
        q.currentCount = Math.min(q.targetCount, q.currentCount + 1);
        if (q.currentCount >= q.targetCount) {
          q.isCompleted = true;
        }
        changed = true;
      }
    }
    if (changed) {
      saveToStorage(STORAGE_KEYS.QUESTS, quests);
    }
  }

  static claimQuestReward(questId: string): number {
    const quests = this.getQuests();
    const quest = quests.find((q) => q.id === questId);
    if (!quest || !quest.isCompleted || quest.isClaimed) return 0;

    quest.isClaimed = true;
    saveToStorage(STORAGE_KEYS.QUESTS, quests);

    const currentUserId = this.getCurrentUserId();
    this.awardXP(currentUserId, quest.xpReward, `Completed quest: ${quest.title}`);
    return quest.xpReward;
  }

  // Skill Tree
  static getSkillNodes(): SkillTreeNode[] {
    return getFromStorage<SkillTreeNode[]>(STORAGE_KEYS.SKILL_NODES, SEED_SKILL_NODES);
  }

  static completeMilestone(nodeId: string, milestoneId: string): void {
    const nodes = this.getSkillNodes();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.isUnlocked) return;

    const milestone = node.milestones.find((m) => m.id === milestoneId);
    if (!milestone || milestone.completed) return;

    milestone.completed = true;
    const allCompleted = node.milestones.every((m) => m.completed);
    if (allCompleted) {
      node.isCompleted = true;
      // Unlock subsequent nodes that depend on this one
      for (const otherNode of nodes) {
        if (!otherNode.isUnlocked && otherNode.prerequisites.includes(node.id)) {
          const allPrereqsDone = otherNode.prerequisites.every(
            (pId) => nodes.find((n) => n.id === pId)?.isCompleted
          );
          if (allPrereqsDone) {
            otherNode.isUnlocked = true;
          }
        }
      }
    }

    saveToStorage(STORAGE_KEYS.SKILL_NODES, nodes);

    // Award XP
    const currentUserId = this.getCurrentUserId();
    this.awardXP(currentUserId, milestone.xpReward, `Completed Skill Milestone: ${milestone.title}`);
  }

  // Learning Circles
  static getCircles(): LearningCircle[] {
    return getFromStorage<LearningCircle[]>(STORAGE_KEYS.CIRCLES, SEED_CIRCLES);
  }

  static createCircle(circle: Omit<LearningCircle, 'id' | 'createdAt' | 'members' | 'updates'>): LearningCircle {
    const circles = this.getCircles();
    const currentUser = this.getCurrentUser();
    const newCircle: LearningCircle = {
      ...circle,
      id: `circle_${Date.now()}`,
      createdAt: new Date().toISOString(),
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: 'leader',
          joinedAt: new Date().toISOString(),
        },
      ],
      updates: [],
    };
    circles.push(newCircle);
    saveToStorage(STORAGE_KEYS.CIRCLES, circles);
    this.awardXP(currentUser.id, 50, `Created Learning Circle: ${newCircle.name}`);
    return newCircle;
  }

  static joinCircle(circleId: string): boolean {
    const circles = this.getCircles();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return false;

    const currentUser = this.getCurrentUser();
    if (circle.members.some((m) => m.userId === currentUser.id)) return false;
    if (circle.members.length >= circle.maxMembers) return false;

    circle.members.push({
      userId: currentUser.id,
      name: currentUser.name,
      avatar: currentUser.avatar,
      role: 'member',
      joinedAt: new Date().toISOString(),
    });

    saveToStorage(STORAGE_KEYS.CIRCLES, circles);
    return true;
  }

  static leaveCircle(circleId: string): boolean {
    const circles = this.getCircles();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return false;

    const currentUserId = this.getCurrentUserId();
    circle.members = circle.members.filter((m) => m.userId !== currentUserId);
    saveToStorage(STORAGE_KEYS.CIRCLES, circles);
    return true;
  }

  static postCircleUpdate(circleId: string, content: string): void {
    const circles = this.getCircles();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return;

    const currentUser = this.getCurrentUser();
    circle.updates.unshift({
      id: `up_${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedByMe: false,
    });

    saveToStorage(STORAGE_KEYS.CIRCLES, circles);
    this.awardXP(currentUser.id, 15, `Shared knowledge update in ${circle.name}`);
  }

  static toggleLikeCircleUpdate(circleId: string, updateId: string): void {
    const circles = this.getCircles();
    const circle = circles.find((c) => c.id === circleId);
    if (!circle) return;

    const update = circle.updates.find((u) => u.id === updateId);
    if (!update) return;

    if (update.likedByMe) {
      update.likes = Math.max(0, update.likes - 1);
      update.likedByMe = false;
    } else {
      update.likes += 1;
      update.likedByMe = true;
    }
    saveToStorage(STORAGE_KEYS.CIRCLES, circles);
  }

  // Notifications
  static getNotifications(userId?: string): InAppNotification[] {
    const all = getFromStorage<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    if (userId) {
      return all.filter((n) => n.userId === userId);
    }
    return all;
  }

  static addNotification(notif: Omit<InAppNotification, 'id' | 'createdAt' | 'isRead'>): void {
    const notifications = getFromStorage<InAppNotification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    notifications.unshift({
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    });
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  static markNotificationRead(notifId: string): void {
    const notifications = this.getNotifications();
    const notif = notifications.find((n) => n.id === notifId);
    if (notif) {
      notif.isRead = true;
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
    }
  }

  static markAllNotificationsRead(userId: string): void {
    const notifications = this.getNotifications();
    for (const n of notifications) {
      if (n.userId === userId) {
        n.isRead = true;
      }
    }
    saveToStorage(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }

  // Content Reports & Admin Safety
  static getReports(): ContentReport[] {
    return getFromStorage<ContentReport[]>(STORAGE_KEYS.REPORTS, SEED_REPORTS);
  }

  static submitReport(report: Omit<ContentReport, 'id' | 'createdAt' | 'status'>): ContentReport {
    const reports = this.getReports();
    const newReport: ContentReport = {
      ...report,
      id: `rep_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    reports.unshift(newReport);
    saveToStorage(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  static updateReportStatus(reportId: string, status: ContentReport['status']): void {
    const reports = this.getReports();
    const rep = reports.find((r) => r.id === reportId);
    if (rep) {
      rep.status = status;
      saveToStorage(STORAGE_KEYS.REPORTS, reports);
    }
  }

  // Leaderboard Calculation
  static getLeaderboard(filter: 'all' | 'learner' | 'tutor' = 'all'): LeaderboardEntry[] {
    // Allow users to opt-out of public leaderboard (Requirement 4)
    const users = this.getUsers().filter((u) => u.role !== 'admin' && !u.optOutOfLeaderboard);
    const filtered = filter === 'all' ? users : users.filter((u) => u.role === filter);

    const sorted = [...filtered].sort((a, b) => b.xp - a.xp);

    return sorted.map((u, index) => ({
      rank: index + 1,
      userId: u.id,
      name: u.name,
      avatar: u.avatar,
      role: u.role,
      weeklyXP: Math.round(u.xp * 0.4),
      totalXP: u.xp,
      level: u.level,
      levelTitle: u.levelTitle,
      badgeCount: u.badges.length,
    }));
  }

  // -------------------------------------------------------------
  // FEATURE FIVE: Skill Exchange Credits Ledger
  // -------------------------------------------------------------
  static getCreditTransactions(userId?: string): CreditTransaction[] {
    const all = getFromStorage<CreditTransaction[]>(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
    return userId ? all.filter((t) => t.userId === userId) : all;
  }

  static addCreditTransaction(data: {
    userId: string;
    type: 'earned' | 'spent' | 'refunded' | 'bonus';
    amount: number;
    description: string;
    relatedSessionId?: string;
  }): CreditTransaction {
    const users = this.getUsers();
    const user = users.find((u) => u.id === data.userId);
    if (!user) throw new Error('User not found.');

    const currentBalance = user.creditBalance !== undefined ? user.creditBalance : 10;
    if (data.type === 'spent' && currentBalance < data.amount) {
      throw new Error(`Insufficient Learning Credits: You have ${currentBalance} credit(s), but this session requires ${data.amount}.`);
    }

    const delta = data.type === 'spent' ? -Math.abs(data.amount) : Math.abs(data.amount);
    const newBalance = Math.max(0, currentBalance + delta);
    user.creditBalance = newBalance;
    saveToStorage(STORAGE_KEYS.USERS, users);

    const txs = this.getCreditTransactions();
    const newTx: CreditTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      relatedSessionId: data.relatedSessionId,
      timestamp: new Date().toISOString(),
      balanceAfter: newBalance,
    };
    txs.unshift(newTx);
    saveToStorage(STORAGE_KEYS.CREDIT_TRANSACTIONS, txs);

    this.addNotification({
      userId: data.userId,
      title: data.type === 'spent' ? 'Learning Credits Deducted' : 'Learning Credits Received! 🪙',
      message: `${data.description} (New Balance: ${newBalance} credits)`,
      type: data.type === 'spent' ? 'credit_spent' : 'credit_earned',
    });

    return newTx;
  }

  // -------------------------------------------------------------
  // FEATURE THREE: Knowledge Gap Detector & Diagnostic Quizzes
  // -------------------------------------------------------------
  static getDiagnosticQuizzes(): DiagnosticQuiz[] {
    return DEFAULT_DIAGNOSTIC_QUIZZES;
  }

  static getDiagnosticResults(userId?: string): DiagnosticQuizResult[] {
    const all = getFromStorage<DiagnosticQuizResult[]>(STORAGE_KEYS.DIAGNOSTIC_RESULTS, []);
    return userId ? all.filter((r) => r.userId === userId) : all;
  }

  static saveDiagnosticResult(
    result: Omit<DiagnosticQuizResult, 'id' | 'completedAt'>
  ): DiagnosticQuizResult {
    const results = this.getDiagnosticResults();
    const newResult: DiagnosticQuizResult = {
      ...result,
      id: `diag_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      completedAt: new Date().toISOString(),
    };
    results.unshift(newResult);
    saveToStorage(STORAGE_KEYS.DIAGNOSTIC_RESULTS, results);

    // Award +50 XP and +2 bonus credits for completing diagnostic check
    this.awardXP(result.userId, 50, `Completed Diagnostic Assessment: ${result.subject}`);
    this.addCreditTransaction({
      userId: result.userId,
      type: 'bonus',
      amount: 2,
      description: `Diagnostic Completion Reward: ${result.subject}`,
    });

    this.addNotification({
      userId: result.userId,
      title: 'Diagnostic Report Ready 📊',
      message: `Your knowledge gap analysis for ${result.subject} scored ${result.scorePercentage}%. Review your weak topics and matched mentors.`,
      type: 'diagnostic_ready',
    });

    return newResult;
  }

  // -------------------------------------------------------------
  // FEATURE SEVEN: Exam Rescue Mode Planner
  // -------------------------------------------------------------
  static getExamRescuePlans(userId?: string): ExamRescuePlan[] {
    const all = getFromStorage<ExamRescuePlan[]>(STORAGE_KEYS.EXAM_RESCUE_PLANS, []);
    return userId ? all.filter((p) => p.userId === userId) : all;
  }

  static saveExamRescuePlan(plan: Omit<ExamRescuePlan, 'id' | 'createdAt'>): ExamRescuePlan {
    const plans = this.getExamRescuePlans();
    const newPlan: ExamRescuePlan = {
      ...plan,
      id: `rescue_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
    };
    plans.unshift(newPlan);
    saveToStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, plans);

    this.awardXP(plan.userId, 40, `Created Exam Rescue Plan: ${plan.subject}`);
    this.addNotification({
      userId: plan.userId,
      title: 'Exam Rescue Mode Activated 🚀',
      message: `Countdown started for your ${plan.subject} exam on ${plan.examDate}. Daily revision tasks have been generated.`,
      type: 'exam_reminder',
    });

    return newPlan;
  }

  static toggleExamRescueTask(planId: string, taskId: string): ExamRescuePlan | null {
    const plans = this.getExamRescuePlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return null;

    const task = plan.tasks.find((t) => t.id === taskId);
    if (task) {
      task.isCompleted = !task.isCompleted;
      if (task.isCompleted) {
        this.awardXP(plan.userId, 20, `Completed Exam Task: ${task.title}`);
      }
      saveToStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, plans);
    }
    return plan;
  }

  static deleteExamRescuePlan(planId: string): void {
    const plans = this.getExamRescuePlans().filter((p) => p.id !== planId);
    saveToStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, plans);
  }

  // -------------------------------------------------------------
  // FEATURE EIGHT: Before-and-After Learning Score (Mastery Delta)
  // -------------------------------------------------------------
  static getLearningScores(userId?: string): LearningScoreAssessment[] {
    const all = getFromStorage<LearningScoreAssessment[]>(STORAGE_KEYS.LEARNING_SCORES, []);
    return userId ? all.filter((s) => s.learnerId === userId || s.tutorId === userId) : all;
  }

  static saveLearningScore(
    data: Omit<LearningScoreAssessment, 'id' | 'scoreDelta' | 'deltaPercentage' | 'date'>
  ): LearningScoreAssessment {
    const scores = this.getLearningScores();
    const delta = data.postQuizScore - data.preQuizScore;
    const deltaPct = Math.round((delta / 10) * 100);

    const newAssessment: LearningScoreAssessment = {
      ...data,
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      scoreDelta: delta,
      deltaPercentage: deltaPct,
      date: new Date().toISOString().split('T')[0],
    };
    scores.unshift(newAssessment);
    saveToStorage(STORAGE_KEYS.LEARNING_SCORES, scores);

    // If positive delta, award learner and tutor mastery XP!
    if (delta > 0) {
      const studentId = data.learnerId || data.studentId;
      if (studentId) {
        this.awardXP(studentId, delta * 15, `Learning Mastery Gain: +${delta} pts in ${data.subject}`);
      }
      if (data.tutorId) {
        this.awardXP(data.tutorId, delta * 20, `Tutor Effectiveness Bonus: +${delta} pts gained by learner`);
      }
    }

    return newAssessment;
  }

  // -------------------------------------------------------------
  // FEATURE NINE: Smart Scheduling & Waitlist System
  // -------------------------------------------------------------
  static getWaitlist(tutorId?: string, learnerId?: string): WaitlistEntry[] {
    const all = getFromStorage<WaitlistEntry[]>(STORAGE_KEYS.WAITLIST, []);
    if (tutorId) return all.filter((w) => w.tutorId === tutorId);
    if (learnerId) return all.filter((w) => w.learnerId === learnerId);
    return all;
  }

  static addToWaitlist(data: Omit<WaitlistEntry, 'id' | 'status' | 'createdAt'>): WaitlistEntry {
    const waitlists = this.getWaitlist();
    const entry: WaitlistEntry = {
      ...data,
      id: `wait_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      status: 'waiting',
      createdAt: new Date().toISOString(),
    };
    waitlists.unshift(entry);
    saveToStorage(STORAGE_KEYS.WAITLIST, waitlists);

    this.addNotification({
      userId: data.tutorId,
      title: 'New Student on Waitlist ⏳',
      message: `${data.learnerName} joined your waitlist for ${data.subject}.`,
      type: 'waitlist_available',
    });

    this.addNotification({
      userId: data.learnerId,
      title: 'Joined Tutor Waitlist',
      message: `You are on the waitlist for ${data.tutorName}. We will notify you the moment a slot opens!`,
      type: 'waitlist_available',
    });

    return entry;
  }

  static updateWaitlistStatus(id: string, status: WaitlistEntry['status']): void {
    const waitlists = this.getWaitlist();
    const item = waitlists.find((w) => w.id === id);
    if (item) {
      item.status = status;
      saveToStorage(STORAGE_KEYS.WAITLIST, waitlists);
      if (status === 'slot_offered') {
        this.addNotification({
          userId: item.learnerId,
          title: '🎉 Waitlist Slot Available!',
          message: `${item.tutorName} has an open slot for ${item.subject}. Book before it is claimed!`,
          type: 'waitlist_available',
        });
      }
    }
  }

  // -------------------------------------------------------------
  // DEMO MODE & SAMPLE DATA TOGGLE (Requirement 16)
  // -------------------------------------------------------------
  static isDemoMode(): boolean {
    return getFromStorage<boolean>(STORAGE_KEYS.DEMO_MODE_ACTIVE, false);
  }

  static setDemoMode(enabled: boolean): void {
    saveToStorage(STORAGE_KEYS.DEMO_MODE_ACTIVE, enabled);
    if (enabled) {
      this.loadDemoSampleData();
    } else {
      this.clearDemoSampleData();
    }
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('brainbridge-storage-update', { detail: { key: 'demo_mode' } }));
    }
  }

  static loadDemoSampleData(): void {
    // Merge sample users while preserving administrator
    const currentUsers = this.getUsers();
    const nonDemoUsers = currentUsers.filter((u) => !DEMO_SAMPLE_USERS.some((d) => d.id === u.id));
    const mergedUsers = [...nonDemoUsers, ...DEMO_SAMPLE_USERS];
    saveToStorage(STORAGE_KEYS.USERS, mergedUsers);

    // Load tutor profiles, slots, circles, quiz results, exam plans, etc.
    saveToStorage(STORAGE_KEYS.TUTOR_PROFILES, DEMO_SAMPLE_TUTOR_PROFILES);
    saveToStorage(STORAGE_KEYS.SLOTS, DEMO_SAMPLE_SLOTS);
    saveToStorage(STORAGE_KEYS.CIRCLES, DEMO_SAMPLE_CIRCLES);
    saveToStorage(STORAGE_KEYS.DIAGNOSTIC_RESULTS, DEMO_SAMPLE_DIAGNOSTIC_RESULTS);
    saveToStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, DEMO_SAMPLE_EXAM_RESCUE_PLANS);
    saveToStorage(STORAGE_KEYS.LEARNING_SCORES, DEMO_SAMPLE_LEARNING_SCORES);
    saveToStorage(STORAGE_KEYS.CREDIT_TRANSACTIONS, DEMO_SAMPLE_CREDIT_TRANSACTIONS);
    saveToStorage(STORAGE_KEYS.WAITLIST, DEMO_SAMPLE_WAITLIST);
    saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, DEMO_SAMPLE_VERIFICATION_REQUESTS);
    saveToStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, DEMO_SAMPLE_TUTOR_APPLICATIONS);

    // Switch active user to Alex Chen for instant student demo view
    this.setCurrentUserId('user_alex');
    this.logActivity('Demo Sample Data Loaded', 'Evaluator activated Demo Mode with realistic campus sample data');
  }

  static clearDemoSampleData(): void {
    // Remove sample users
    const currentUsers = this.getUsers().filter((u) => !DEMO_SAMPLE_USERS.some((d) => d.id === u.id));
    if (currentUsers.length === 0) {
      currentUsers.push(SEED_USERS[0]);
    }
    saveToStorage(STORAGE_KEYS.USERS, currentUsers);

    // Restore clean states
    saveToStorage(STORAGE_KEYS.TUTOR_PROFILES, []);
    saveToStorage(STORAGE_KEYS.SLOTS, []);
    saveToStorage(STORAGE_KEYS.CIRCLES, []);
    saveToStorage(STORAGE_KEYS.DIAGNOSTIC_RESULTS, []);
    saveToStorage(STORAGE_KEYS.EXAM_RESCUE_PLANS, []);
    saveToStorage(STORAGE_KEYS.LEARNING_SCORES, []);
    saveToStorage(STORAGE_KEYS.CREDIT_TRANSACTIONS, []);
    saveToStorage(STORAGE_KEYS.WAITLIST, []);
    saveToStorage(STORAGE_KEYS.VERIFICATION_REQUESTS, []);
    saveToStorage(STORAGE_KEYS.TUTOR_APPLICATIONS, []);

    this.setCurrentUserId(currentUsers[0]?.id || 'user_admin');
    this.logActivity('Demo Sample Data Cleared', 'Platform returned to clean institutional production state');
  }

  // -------------------------------------------------------------
  // THEME & PRIVACY SETTINGS
  // -------------------------------------------------------------
  static getTheme(): 'light' | 'dark' {
    return getFromStorage<'light' | 'dark'>(STORAGE_KEYS.THEME, 'light');
  }

  static setTheme(theme: 'light' | 'dark'): void {
    saveToStorage(STORAGE_KEYS.THEME, theme);
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }

  static toggleTheme(): 'light' | 'dark' {
    const nextTheme = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(nextTheme);
    return nextTheme;
  }

  static toggleLeaderboardOptOut(userId: string): boolean {
    const users = this.getUsers();
    const user = users.find((u) => u.id === userId);
    if (user) {
      user.optOutOfLeaderboard = !user.optOutOfLeaderboard;
      saveToStorage(STORAGE_KEYS.USERS, users);
      return !!user.optOutOfLeaderboard;
    }
    return false;
  }
}

// Auto-initialize on module import
LocalStorageAdapter.init();

export const storage = LocalStorageAdapter;
