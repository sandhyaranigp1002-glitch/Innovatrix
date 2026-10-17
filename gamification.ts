import { Badge, UserProfile } from '../types';

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
  color: string;
  badgeBg: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: 'Beginner', minXP: 0, maxXP: 199, color: 'text-slate-600', badgeBg: 'bg-slate-100 border-slate-300' },
  { level: 2, title: 'Explorer', minXP: 200, maxXP: 499, color: 'text-emerald-600', badgeBg: 'bg-emerald-50 border-emerald-300' },
  { level: 3, title: 'Achiever', minXP: 500, maxXP: 899, color: 'text-blue-600', badgeBg: 'bg-blue-50 border-blue-300' },
  { level: 4, title: 'Mentor', minXP: 900, maxXP: 1499, color: 'text-indigo-600', badgeBg: 'bg-indigo-50 border-indigo-300' },
  { level: 5, title: 'Champion', minXP: 1500, maxXP: 2499, color: 'text-purple-600', badgeBg: 'bg-purple-50 border-purple-300' },
  { level: 6, title: 'Legend', minXP: 2500, maxXP: 999999, color: 'text-amber-600', badgeBg: 'bg-amber-50 border-amber-300' },
];

export const XP_CONFIG = {
  LEARNER_SESSION_COMPLETED: 100,
  TUTOR_SESSION_COMPLETED: 150,
  POST_REVIEW: 25,
  RECEIVED_5_STAR: 40,
  SKILL_MILESTONE: 50,
  CIRCLE_UPDATE: 15,
  DAILY_QUEST_DEFAULT: 40,
};

export const ALL_BADGES: Badge[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first peer tutoring session.',
    icon: 'Sparkles',
    category: 'learning',
    xpReward: 50,
    criteria: 'Complete 1 session as either learner or tutor',
  },
  {
    id: 'knowledge_sharer',
    name: 'Knowledge Sharer',
    description: 'Complete five sessions as a tutor guiding peers.',
    icon: 'GraduationCap',
    category: 'teaching',
    xpReward: 150,
    criteria: 'Teach 5 peer tutoring sessions',
  },
  {
    id: 'curious_mind',
    name: 'Curious Mind',
    description: 'Complete five tutoring sessions as a learner.',
    icon: 'Brain',
    category: 'learning',
    xpReward: 150,
    criteria: 'Learn across 5 completed tutoring sessions',
  },
  {
    id: 'consistency_star',
    name: 'Consistency Star',
    description: 'Maintain a 7-day active learning streak.',
    icon: 'Flame',
    category: 'streak',
    xpReward: 200,
    criteria: 'Reach a streak of 7 consecutive active days',
  },
  {
    id: 'community_hero',
    name: 'Community Hero',
    description: 'Help 3 or more unique fellow university students.',
    icon: 'HeartHandshake',
    category: 'community',
    xpReward: 180,
    criteria: 'Tutor 3 different students',
  },
  {
    id: 'subject_explorer',
    name: 'Subject Explorer',
    description: 'Learn or master across 3 different academic subjects.',
    icon: 'Compass',
    category: 'mastery',
    xpReward: 120,
    criteria: 'Engage with sessions in at least 3 distinct subjects',
  },
  {
    id: 'perfect_partner',
    name: 'Perfect Partner',
    description: 'Receive multiple positive reviews (4+ stars) from peers.',
    icon: 'Award',
    category: 'community',
    xpReward: 160,
    criteria: 'Receive 3 or more 4+ star reviews',
  },
  {
    id: 'level_up',
    name: 'Level Up',
    description: 'Reach Level 3 (Achiever) or higher in BrainBridge.',
    icon: 'TrendingUp',
    category: 'mastery',
    xpReward: 100,
    criteria: 'Accumulate 500+ XP to reach Achiever rank',
  },
];

export function getLevelForXP(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

export function getXPProgress(xp: number): { currentXP: number; minXP: number; maxXP: number; progressPercent: number; nextLevelTarget: number } {
  const currentLevel = getLevelForXP(xp);
  const nextLevel = LEVELS.find((l) => l.level === currentLevel.level + 1);

  if (!nextLevel) {
    return {
      currentXP: xp,
      minXP: currentLevel.minXP,
      maxXP: currentLevel.minXP,
      progressPercent: 100,
      nextLevelTarget: xp,
    };
  }

  const range = nextLevel.minXP - currentLevel.minXP;
  const inRange = xp - currentLevel.minXP;
  const progressPercent = Math.min(100, Math.max(0, Math.round((inRange / range) * 100)));

  return {
    currentXP: xp,
    minXP: currentLevel.minXP,
    maxXP: nextLevel.minXP,
    progressPercent,
    nextLevelTarget: nextLevel.minXP,
  };
}

export function calculateStreak(lastActiveDateStr: string, currentStreak: number): { newStreak: number; updated: boolean } {
  if (!lastActiveDateStr) {
    return { newStreak: 1, updated: true };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastDate = new Date(lastActiveDateStr);
  lastDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today; streak remains unchanged
    return { newStreak: currentStreak, updated: false };
  } else if (diffDays === 1) {
    // Yesterday was active; increase streak!
    return { newStreak: currentStreak + 1, updated: true };
  } else {
    // Streak broken; reset to 1
    return { newStreak: 1, updated: true };
  }
}

export function calculateImpactScore(params: {
  sessionsCompleted: number;
  uniqueStudentsHelped: number;
  distinctSubjects: number;
  positiveReviewsCount: number;
}): { score: number; formula: string; breakdown: { label: string; value: number; points: number }[] } {
  const sessionPoints = params.sessionsCompleted * 15;
  const studentPoints = params.uniqueStudentsHelped * 25;
  const subjectPoints = params.distinctSubjects * 10;
  const reviewPoints = params.positiveReviewsCount * 12;

  const total = sessionPoints + studentPoints + subjectPoints + reviewPoints;

  return {
    score: total,
    formula: '(Sessions × 15) + (Unique Students Helped × 25) + (Subjects × 10) + (High Ratings × 12)',
    breakdown: [
      { label: 'Completed Sessions', value: params.sessionsCompleted, points: sessionPoints },
      { label: 'Unique Peers Helped', value: params.uniqueStudentsHelped, points: studentPoints },
      { label: 'Subjects Covered', value: params.distinctSubjects, points: subjectPoints },
      { label: 'Top Peer Ratings (4★+)', value: params.positiveReviewsCount, points: reviewPoints },
    ],
  };
}
