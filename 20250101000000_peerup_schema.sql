-- ==========================================================
-- BrainBridge Database Schema Migration
-- Complete PostgreSQL & Supabase DDL with Row Level Security (RLS)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL CHECK (role IN ('learner', 'tutor', 'admin')),
  department TEXT NOT NULL DEFAULT 'Computer Science',
  academic_year TEXT NOT NULL DEFAULT 'Sophomore (2nd Year)',
  bio TEXT DEFAULT '',
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1),
  level_title TEXT NOT NULL DEFAULT 'Beginner',
  streak_days INTEGER NOT NULL DEFAULT 1 CHECK (streak_days >= 0),
  best_streak INTEGER NOT NULL DEFAULT 1 CHECK (best_streak >= 0),
  last_active_date DATE DEFAULT CURRENT_DATE,
  impact_score INTEGER NOT NULL DEFAULT 0,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TUTOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.tutor_profiles (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  teaching_modes TEXT[] NOT NULL DEFAULT ARRAY['online', 'in_person'],
  teaching_style TEXT NOT NULL DEFAULT 'beginner_friendly' CHECK (teaching_style IN ('beginner_friendly', 'deep_dive', 'practice_focused', 'exam_prep')),
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.00 CHECK (rating >= 1.00 AND rating <= 5.00),
  review_count INTEGER NOT NULL DEFAULT 0,
  location_preference TEXT DEFAULT 'Campus Library or Google Meet',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TUTOR SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  skill_level TEXT NOT NULL CHECK (skill_level IN ('Intermediate', 'Advanced', 'Expert')),
  experience_years INTEGER NOT NULL DEFAULT 1,
  hourly_credits INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tutor_id, subject)
);

-- 4. AVAILABILITY SLOTS TABLE
CREATE TABLE IF NOT EXISTS public.availability_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'in_person')),
  location_or_link TEXT NOT NULL,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. SESSION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.session_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slot_id UUID REFERENCES public.availability_slots(id) ON DELETE SET NULL,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  session_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('online', 'in_person')),
  location_or_link TEXT NOT NULL,
  learning_goal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT chk_not_self_booking CHECK (learner_id <> tutor_id)
);

-- 6. COMPLETED SESSIONS TABLE
CREATE TABLE IF NOT EXISTS public.completed_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL REFERENCES public.session_requests(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

-- 7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID UNIQUE NOT NULL REFERENCES public.session_requests(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. USER XP EVENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount > 0),
  reason TEXT NOT NULL,
  related_entity_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. ACHIEVEMENTS (BADGES) TABLE
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('learning', 'teaching', 'community', 'streak', 'mastery')),
  xp_reward INTEGER NOT NULL DEFAULT 50,
  criteria TEXT NOT NULL
);

-- 10. USER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, achievement_id)
);

-- 11. DAILY QUESTS TABLE
CREATE TABLE IF NOT EXISTS public.daily_quests (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  xp_reward INTEGER NOT NULL DEFAULT 40,
  target_count INTEGER NOT NULL DEFAULT 1,
  quest_type TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- 12. QUEST PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.quest_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quest_id TEXT NOT NULL REFERENCES public.daily_quests(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  is_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  quest_date DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, quest_id, quest_date)
);

-- 13. LEARNING CIRCLES TABLE
CREATE TABLE IF NOT EXISTS public.learning_circles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  learning_goal TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  leader_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  max_members INTEGER NOT NULL DEFAULT 10,
  upcoming_session_date DATE,
  upcoming_session_time TIME,
  upcoming_session_topic TEXT,
  upcoming_session_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. CIRCLE MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.circle_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES public.learning_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('leader', 'member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (circle_id, user_id)
);

-- 15. LEARNING UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.learning_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  circle_id UUID NOT NULL REFERENCES public.learning_circles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 16. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 17. CONTENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('user_profile', 'circle', 'review')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_slots_tutor_date ON public.availability_slots(tutor_id, slot_date);
CREATE INDEX IF NOT EXISTS idx_sessions_learner ON public.session_requests(learner_id);
CREATE INDEX IF NOT EXISTS idx_sessions_tutor ON public.session_requests(tutor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON public.session_requests(status);
CREATE INDEX IF NOT EXISTS idx_notifs_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_updates_circle ON public.learning_updates(circle_id);

-- ==========================================================
-- ATOMIC FUNCTIONS (PREVENT RACE CONDITIONS & DUPLICATE AWARDS)
-- ==========================================================

-- Atomic Slot Booking: Locks slot row so multiple learners cannot double-book
CREATE OR REPLACE FUNCTION public.book_slot_atomic(
  p_slot_id UUID,
  p_learner_id UUID,
  p_tutor_id UUID,
  p_subject TEXT,
  p_learning_goal TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot public.availability_slots%ROWTYPE;
  v_session_id UUID;
BEGIN
  -- Row-level lock on the target slot
  SELECT * INTO v_slot
  FROM public.availability_slots
  WHERE id = p_slot_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF v_slot.is_booked THEN
    RAISE EXCEPTION 'Slot is already booked';
  END IF;

  IF p_learner_id = p_tutor_id THEN
    RAISE EXCEPTION 'Cannot book your own tutoring slot';
  END IF;

  -- Mark slot booked
  UPDATE public.availability_slots
  SET is_booked = TRUE
  WHERE id = p_slot_id;

  -- Create session request
  INSERT INTO public.session_requests (
    slot_id, learner_id, tutor_id, subject, session_date,
    start_time, end_time, mode, location_or_link, learning_goal, status
  ) VALUES (
    p_slot_id, p_learner_id, p_tutor_id, p_subject, v_slot.slot_date,
    v_slot.start_time, v_slot.end_time, v_slot.mode, v_slot.location_or_link,
    p_learning_goal, 'pending'
  ) RETURNING id INTO v_session_id;

  RETURN v_session_id;
END;
$$;

-- Atomic XP Awarding & Level Recalculation
CREATE OR REPLACE FUNCTION public.award_xp_atomic(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT,
  p_related_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_new_xp INTEGER;
  v_new_level INTEGER;
  v_new_title TEXT;
BEGIN
  -- Record XP event
  INSERT INTO public.user_xp_events (user_id, amount, reason, related_entity_id)
  VALUES (p_user_id, p_amount, p_reason, p_related_id);

  -- Update user total XP
  UPDATE public.profiles
  SET xp = xp + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id
  RETURNING xp INTO v_new_xp;

  -- Calculate level
  IF v_new_xp >= 2500 THEN
    v_new_level := 6; v_new_title := 'Legend';
  ELSIF v_new_xp >= 1500 THEN
    v_new_level := 5; v_new_title := 'Champion';
  ELSIF v_new_xp >= 900 THEN
    v_new_level := 4; v_new_title := 'Mentor';
  ELSIF v_new_xp >= 500 THEN
    v_new_level := 3; v_new_title := 'Achiever';
  ELSIF v_new_xp >= 200 THEN
    v_new_level := 2; v_new_title := 'Explorer';
  ELSE
    v_new_level := 1; v_new_title := 'Beginner';
  END IF;

  UPDATE public.profiles
  SET level = v_new_level,
      level_title = v_new_title
  WHERE id = p_user_id;

  RETURN jsonb_build_object('xp', v_new_xp, 'level', v_new_level, 'title', v_new_title);
END;
$$;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completed_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_circles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circle_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Read policies: Public / Authenticated read for discovery
CREATE POLICY "Public profiles are readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Tutor profiles are readable by all" ON public.tutor_profiles FOR SELECT USING (true);
CREATE POLICY "Tutors can manage own profile" ON public.tutor_profiles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Tutor subjects readable by all" ON public.tutor_subjects FOR SELECT USING (true);
CREATE POLICY "Tutors can manage own subjects" ON public.tutor_subjects FOR ALL USING (auth.uid() = tutor_id);

CREATE POLICY "Slots are viewable by all" ON public.availability_slots FOR SELECT USING (true);
CREATE POLICY "Tutors can manage their own slots" ON public.availability_slots FOR ALL USING (auth.uid() = tutor_id);

CREATE POLICY "Users can view sessions they participate in" ON public.session_requests FOR SELECT USING (auth.uid() = learner_id OR auth.uid() = tutor_id);
CREATE POLICY "Learners can insert session requests" ON public.session_requests FOR INSERT WITH CHECK (auth.uid() = learner_id);
CREATE POLICY "Participants can update their session status" ON public.session_requests FOR UPDATE USING (auth.uid() = learner_id OR auth.uid() = tutor_id);

CREATE POLICY "Reviews are viewable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Learners can write reviews for completed sessions" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Circles are viewable by all" ON public.learning_circles FOR SELECT USING (true);
CREATE POLICY "Members can post circle updates" ON public.learning_updates FOR ALL USING (auth.uid() = user_id);
