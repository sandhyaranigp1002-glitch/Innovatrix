export type UserRole = 'learner' | 'tutor' | 'admin';
export type VerificationStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar: string;
  role: UserRole;
  department: string;
  academicYear: string;
  semester?: string;
  bio: string;
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  impactScore: number;
  verified: boolean;
  badges: string[]; // Badge IDs
  status?: 'active' | 'suspended';
  prn?: string;
  prnMasked?: string;
  verificationStatus?: VerificationStatus;
  rejectionReason?: string;
  isTutorApproved?: boolean;
  creditBalance: number;
  optOutOfLeaderboard?: boolean;
  languages?: string[];
  themePreference?: 'light' | 'dark';
}

export interface ApprovedPRN {
  id: string;
  prn: string;
  prnMasked: string;
  studentName: string;
  email: string;
  department: string;
  academicYear: string;
  semester?: string;
  isRegistered: boolean;
  registeredUserId?: string;
  createdAt: string;
}

export interface StudentVerificationRequest {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  department: string;
  academicYear: string;
  semester?: string;
  prn: string;
  prnMasked: string;
  status: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface TutorApplication {
  id: string;
  userId: string;
  studentName: string;
  email: string;
  department: string;
  subjects: string[];
  expertiseSummary: string;
  teachingStyle: TeachingStyle;
  hourlyCredits: number;
  status: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface CollegeSecurityConfig {
  prnFormatPattern: string;
  prnFormatName: string;
  allowedEmailDomain: string;
  requireAdminApproval: boolean;
}

export interface AuthSession {
  userId: string;
  role: UserRole;
  token: string;
  loginTime: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
}

export interface TutorSubject {
  id: string;
  subject: string;
  skillLevel: 'Intermediate' | 'Advanced' | 'Expert';
  experienceYears: number;
  hourlyCredits: number;
}

export type TeachingStyle = 'beginner_friendly' | 'deep_dive' | 'practice_focused' | 'exam_prep';

export interface TutorProfile {
  userId: string;
  subjects: TutorSubject[];
  teachingModes: ('online' | 'in_person')[];
  teachingStyle: TeachingStyle;
  rating: number;
  reviewCount: number;
  locationPreference: string;
  verified: boolean;
}

export interface AvailabilitySlot {
  id: string;
  tutorId: string;
  dayOfWeek: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  mode: 'online' | 'in_person';
  locationOrLink: string;
  isBooked: boolean;
}

export type SessionStatus = 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';

export interface SessionRequest {
  id: string;
  slotId: string;
  learnerId: string;
  tutorId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  mode: 'online' | 'in_person';
  locationOrLink: string;
  learningGoal: string;
  status: SessionStatus;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface SessionReview {
  id: string;
  sessionId: string;
  tutorId: string;
  learnerId: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'learning' | 'teaching' | 'community' | 'streak' | 'mastery';
  xpReward: number;
  criteria: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  targetCount: number;
  currentCount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  questType: 'find_tutor' | 'send_goal' | 'complete_session' | 'study_circle';
  date: string;
}

export interface SkillMilestone {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  completed: boolean;
}

export interface SkillTreeNode {
  id: string;
  subject: string;
  title: string;
  category: 'programming' | 'core_cs' | 'problem_solving' | 'emerging_tech';
  level: 'Fundamental' | 'Intermediate' | 'Advanced';
  icon: string;
  prerequisites: string[];
  isUnlocked: boolean;
  isCompleted: boolean;
  milestones: SkillMilestone[];
  sessionsRequired: number;
  sessionsCompleted: number;
}

export interface CircleMember {
  userId: string;
  name: string;
  avatar: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface CircleUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
}

export interface LearningCircle {
  id: string;
  name: string;
  subject: string;
  description: string;
  learningGoal: string;
  tags: string[];
  leaderId: string;
  members: CircleMember[];
  maxMembers: number;
  updates: CircleUpdate[];
  upcomingSession?: {
    date: string;
    time: string;
    topic: string;
    meetingLink: string;
  };
  createdAt: string;
}

export interface InAppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type:
    | 'request_new'
    | 'request_accepted'
    | 'request_declined'
    | 'session_upcoming'
    | 'session_completed'
    | 'badge_unlocked'
    | 'level_up'
    | 'circle_update'
    | 'waitlist_available'
    | 'credit_earned'
    | 'credit_spent'
    | 'exam_reminder'
    | 'diagnostic_ready'
    | 'verification_approved'
    | 'verification_rejected';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'user_profile' | 'circle' | 'review';
  targetId: string;
  targetName: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  role: UserRole;
  weeklyXP: number;
  totalXP: number;
  level: number;
  levelTitle: string;
  badgeCount: number;
}

export interface TutorMatchRecommendation {
  tutor: UserProfile;
  tutorProfile: TutorProfile;
  score: number;
  matchReasons: string[];
  availableSlots: AvailabilitySlot[];
}

// -------------------------------------------------------------
// NEW FEATURE: Skill Exchange Credits Ledger
// -------------------------------------------------------------
export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'earned' | 'spent' | 'refunded' | 'bonus' | 'session_booking' | 'session_taught' | 'quest_reward';
  amount: number;
  description: string;
  relatedSessionId?: string;
  referenceId?: string;
  timestamp: string;
  createdAt?: string;
  balanceAfter?: number;
  isDemoSample?: boolean;
}

// -------------------------------------------------------------
// NEW FEATURE: Knowledge Gap Detector & Diagnostic Quizzes
// -------------------------------------------------------------
export interface DiagnosticQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface DiagnosticQuiz {
  id: string;
  subject: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questions: DiagnosticQuestion[];
}

export interface DiagnosticQuizResult {
  id: string;
  userId: string;
  quizId: string;
  subject: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  weakTopics: string[];
  strongTopics: string[];
  recommendedTutorSubjects: string[];
  practicePlan: string[];
  completedAt: string;
  isDemoSample?: boolean;
}

// -------------------------------------------------------------
// NEW FEATURE: Exam Rescue Mode Planner
// -------------------------------------------------------------
export interface ExamRescueTask {
  id: string;
  title: string;
  topic: string;
  estimatedMinutes: number;
  priority: 'high' | 'medium' | 'low';
  isCompleted: boolean;
  scheduledDate: string;
  dueDate?: string;
  completed?: boolean;
  type?: 'concept_review' | 'practice_problems' | 'quiz' | 'tutor_session';
  recommendedTutorSubject?: string;
}

export interface ExamRescuePlan {
  id: string;
  userId: string;
  subject: string;
  examDate: string; // YYYY-MM-DD
  topics: string[];
  topicsToStudy?: string[];
  weakTopics: string[];
  confidenceLevel: number; // 1-5
  selfRatedConfidence?: number;
  dailyStudyHours?: number;
  dailyStudyMinutes?: number;
  tasks: ExamRescueTask[];
  overallProgressPercent?: number;
  recommendedTutorSubjects: string[];
  createdAt: string;
  isDemoSample?: boolean;
}

// -------------------------------------------------------------
// NEW FEATURE: Before-and-After Learning Score (Mastery Delta)
// -------------------------------------------------------------
export interface LearningScoreAssessment {
  id: string;
  sessionId: string;
  learnerId?: string;
  studentId?: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  topic: string;
  preQuizScore: number; // out of 10
  postQuizScore: number; // out of 10
  preScore?: number;
  postScore?: number;
  maxScore?: number;
  scoreDelta: number; // post - pre
  deltaPercentage: number;
  improvementPercent?: number;
  feedbackNotes: string;
  nextSteps?: string[];
  date: string;
  completedAt?: string;
  isDemoSample?: boolean;
}

// -------------------------------------------------------------
// NEW FEATURE: Smart Scheduling Waitlist Entry
// -------------------------------------------------------------
export interface WaitlistEntry {
  id: string;
  tutorId: string;
  tutorName: string;
  learnerId: string;
  learnerName: string;
  learnerEmail: string;
  subject: string;
  preferredTime: string;
  preferredMode: 'online' | 'in_person';
  notes: string;
  status: 'waiting' | 'slot_offered' | 'fulfilled' | 'cancelled';
  createdAt: string;
}
