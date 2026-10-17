-- ====================================================================
-- BRAINBRIDGE: FEATURE EXPANSION MIGRATION (V3)
-- Covers: Skill Exchange Credits Ledger, Knowledge Gap Diagnostics,
-- Exam Rescue Mode Sprints, Before-and-After Learning Scores, & Waitlist
-- ====================================================================

-- 1. Skill Exchange Credits Transactions Ledger
CREATE TABLE IF NOT EXISTS public.credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('earned', 'spent', 'refunded', 'bonus', 'session_booking', 'session_taught', 'quest_reward')),
    description TEXT NOT NULL,
    related_session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo_sample BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_credit_tx_user ON public.credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_tx_created ON public.credit_transactions(created_at DESC);

-- Enable RLS on credit_transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credit ledger"
    ON public.credit_transactions FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Only admin or service role can insert transactions directly"
    ON public.credit_transactions FOR INSERT
    WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

-- 2. Diagnostic Quizzes & Knowledge Gap Assessment Results
CREATE TABLE IF NOT EXISTS public.diagnostic_quizzes (
    id TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 15,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.diagnostic_quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view diagnostic quizzes"
    ON public.diagnostic_quizzes FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE TABLE IF NOT EXISTS public.diagnostic_quiz_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id TEXT NOT NULL REFERENCES public.diagnostic_quizzes(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    score_percentage INTEGER NOT NULL,
    weak_topics TEXT[] NOT NULL DEFAULT '{}',
    strong_topics TEXT[] NOT NULL DEFAULT '{}',
    recommended_tutor_subjects TEXT[] NOT NULL DEFAULT '{}',
    practice_plan TEXT[] NOT NULL DEFAULT '{}',
    completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo_sample BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_diag_results_user ON public.diagnostic_quiz_results(user_id);
ALTER TABLE public.diagnostic_quiz_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own diagnostic results"
    ON public.diagnostic_quiz_results FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can record own diagnostic results"
    ON public.diagnostic_quiz_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 3. Exam Rescue Mode Plans & Sprints
CREATE TABLE IF NOT EXISTS public.exam_rescue_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    exam_date DATE NOT NULL,
    topics TEXT[] NOT NULL DEFAULT '{}',
    weak_topics TEXT[] NOT NULL DEFAULT '{}',
    confidence_level INTEGER NOT NULL CHECK (confidence_level BETWEEN 1 AND 5),
    daily_study_hours NUMERIC(3,1) NOT NULL DEFAULT 1.5,
    tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommended_tutor_subjects TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo_sample BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_exam_plans_user ON public.exam_rescue_plans(user_id);
ALTER TABLE public.exam_rescue_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own exam rescue plans"
    ON public.exam_rescue_plans FOR ALL
    USING (auth.uid() = user_id OR public.is_admin())
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- 4. Before-and-After Learning Score Assessments (Efficacy Delta)
CREATE TABLE IF NOT EXISTS public.learning_score_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
    learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    pre_quiz_score NUMERIC(4,1) NOT NULL,
    post_quiz_score NUMERIC(4,1) NOT NULL,
    score_delta NUMERIC(4,1) NOT NULL,
    delta_percentage INTEGER NOT NULL,
    feedback_notes TEXT,
    next_steps TEXT[] NOT NULL DEFAULT '{}',
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    is_demo_sample BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_learning_scores_learner ON public.learning_score_assessments(learner_id);
CREATE INDEX IF NOT EXISTS idx_learning_scores_tutor ON public.learning_score_assessments(tutor_id);
ALTER TABLE public.learning_score_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner, tutor, or admin can view learning assessments"
    ON public.learning_score_assessments FOR SELECT
    USING (auth.uid() = learner_id OR auth.uid() = tutor_id OR public.is_admin());

CREATE POLICY "Participants can insert learning assessments"
    ON public.learning_score_assessments FOR INSERT
    WITH CHECK (auth.uid() = learner_id OR auth.uid() = tutor_id OR public.is_admin());

-- 5. Scheduling Waitlist System
CREATE TABLE IF NOT EXISTS public.scheduling_waitlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    tutor_name TEXT NOT NULL,
    learner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    learner_name TEXT NOT NULL,
    learner_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    preferred_time TEXT NOT NULL,
    preferred_mode TEXT NOT NULL CHECK (preferred_mode IN ('online', 'in_person')),
    notes TEXT,
    status TEXT NOT NULL CHECK (status IN ('waiting', 'slot_offered', 'fulfilled', 'cancelled')) DEFAULT 'waiting',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_waitlist_tutor ON public.scheduling_waitlists(tutor_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_learner ON public.scheduling_waitlists(learner_id);
ALTER TABLE public.scheduling_waitlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Learner, tutor or admin can view waitlists"
    ON public.scheduling_waitlists FOR SELECT
    USING (auth.uid() = learner_id OR auth.uid() = tutor_id OR public.is_admin());

CREATE POLICY "Students can join waitlist"
    ON public.scheduling_waitlists FOR INSERT
    WITH CHECK (auth.uid() = learner_id);

CREATE POLICY "Tutor or student can update waitlist entry"
    ON public.scheduling_waitlists FOR UPDATE
    USING (auth.uid() = learner_id OR auth.uid() = tutor_id OR public.is_admin());
