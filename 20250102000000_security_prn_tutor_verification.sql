-- ==========================================================
-- BrainBridge Security Upgrade Migration
-- PRN Verification, Secure Tutor Promotion, and Admin Access Control
-- ==========================================================

-- Enable pgcrypto for secure hashing if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. UPDATE PROFILES WITH PRN & SECURITY ATTRIBUTES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS prn_hash TEXT,
  ADD COLUMN IF NOT EXISTS prn_masked TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_tutor_approved BOOLEAN NOT NULL DEFAULT FALSE;

-- Ensure uniqueness of PRN hash across active profiles (prevents duplicate PRNs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_prn_hash 
  ON public.profiles(prn_hash) 
  WHERE prn_hash IS NOT NULL;

-- 2. APPROVED STUDENT PRN ROSTER TABLE (Admin-Managed College Roster)
CREATE TABLE IF NOT EXISTS public.approved_student_prns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prn_hash TEXT UNIQUE NOT NULL,
  prn_masked TEXT NOT NULL,
  student_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  is_registered BOOLEAN NOT NULL DEFAULT FALSE,
  registered_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 3. STUDENT VERIFICATION REQUESTS QUEUE
CREATE TABLE IF NOT EXISTS public.student_verification_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  prn_hash TEXT NOT NULL,
  prn_masked TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 4. TUTOR APPLICATIONS QUEUE (Requires Admin Approval)
CREATE TABLE IF NOT EXISTS public.tutor_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  email TEXT NOT NULL,
  department TEXT NOT NULL,
  subjects TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  expertise_summary TEXT NOT NULL,
  teaching_style TEXT NOT NULL DEFAULT 'beginner_friendly' 
    CHECK (teaching_style IN ('beginner_friendly', 'deep_dive', 'practice_focused', 'exam_prep')),
  hourly_credits INTEGER NOT NULL DEFAULT 1 CHECK (hourly_credits >= 1 AND hourly_credits <= 5),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 5. COMPREHENSIVE SECURITY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==========================================================
-- SECURITY DEFINER HELPER FUNCTIONS
-- ==========================================================

-- Check if current authenticated user has administrative role
CREATE OR REPLACE FUNCTION public.is_admin(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND role = 'admin'
  );
$$;

-- Check if student PRN verification is approved
CREATE OR REPLACE FUNCTION public.is_verified_student(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id AND verification_status = 'approved'
  );
$$;

-- Check if tutor is officially approved by campus administration
CREATE OR REPLACE FUNCTION public.is_approved_tutor(p_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = p_user_id 
      AND role = 'tutor' 
      AND is_tutor_approved = TRUE
      AND verification_status = 'approved'
  );
$$;

-- ==========================================================
-- PRIVILEGE ESCALATION PROTECTION TRIGGER
-- Prevents ordinary users from granting themselves Tutor or Admin roles,
-- or bypassing PRN verification status on their own profile.
-- ==========================================================
CREATE OR REPLACE FUNCTION public.check_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- If user is modifying their own record and is NOT an admin:
  IF auth.uid() = OLD.id AND NOT public.is_admin(auth.uid()) THEN
    -- Check if attempting to change privileged fields
    IF NEW.role <> OLD.role THEN
      RAISE EXCEPTION 'Access Denied: You cannot modify your own system role.';
    END IF;
    IF NEW.verification_status <> OLD.verification_status THEN
      RAISE EXCEPTION 'Access Denied: PRN verification status can only be modified by campus administrators.';
    END IF;
    IF NEW.is_tutor_approved <> OLD.is_tutor_approved THEN
      RAISE EXCEPTION 'Access Denied: Tutor approval status can only be modified by campus administrators.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_privilege_escalation();

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================

-- Enable RLS on new tables
ALTER TABLE public.approved_student_prns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. approved_student_prns: STRICTLY ADMIN ONLY
-- Normal users can NEVER query or view the approved PRN roster!
CREATE POLICY "Only admins can view approved PRN roster"
  ON public.approved_student_prns
  FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Only admins can modify approved PRN roster"
  ON public.approved_student_prns
  FOR ALL
  USING (public.is_admin(auth.uid()));

-- 2. student_verification_requests
-- Students can only view their own request; Admins can view and review all
CREATE POLICY "Students can view own verification request"
  ON public.student_verification_requests
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Students can submit own verification request"
  ON public.student_verification_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Only admins can update verification requests"
  ON public.student_verification_requests
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 3. tutor_applications
-- Verified students can submit and view their own application; Admins manage all
CREATE POLICY "Students can view own tutor application"
  ON public.tutor_applications
  FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Verified students can submit tutor applications"
  ON public.tutor_applications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_verified_student(auth.uid()));

CREATE POLICY "Only admins can review tutor applications"
  ON public.tutor_applications
  FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- 4. audit_logs: STRICTLY ADMIN READ ONLY
CREATE POLICY "Only admins can view audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 5. availability_slots: ONLY APPROVED TUTORS CAN PUBLISH SLOTS
DROP POLICY IF EXISTS "Tutors can manage their own slots" ON public.availability_slots;

CREATE POLICY "Approved tutors can manage their own slots"
  ON public.availability_slots
  FOR ALL
  USING (
    auth.uid() = tutor_id 
    AND (public.is_approved_tutor(auth.uid()) OR public.is_admin(auth.uid()))
  );

-- 6. session_requests: ONLY APPROVED TUTORS CAN ACCEPT SESSIONS
DROP POLICY IF EXISTS "Participants can update their session status" ON public.session_requests;

CREATE POLICY "Learners can cancel their own session requests"
  ON public.session_requests
  FOR UPDATE
  USING (auth.uid() = learner_id)
  WITH CHECK (status = 'cancelled');

CREATE POLICY "Approved tutors can update session status"
  ON public.session_requests
  FOR UPDATE
  USING (
    auth.uid() = tutor_id 
    AND (public.is_approved_tutor(auth.uid()) OR public.is_admin(auth.uid()))
  );

-- 7. session_requests: ONLY VERIFIED STUDENTS CAN BOOK SESSIONS
DROP POLICY IF EXISTS "Learners can insert session requests" ON public.session_requests;

CREATE POLICY "Only verified learners can book session requests"
  ON public.session_requests
  FOR INSERT
  WITH CHECK (
    auth.uid() = learner_id 
    AND public.is_verified_student(auth.uid())
  );

-- ==========================================================
-- SECURE SERVER-SIDE ADMIN PROVISIONING PROCEDURE
-- Run this function in Supabase SQL editor or migration runner to provision admins.
-- NEVER expose this to client-side code!
-- ==========================================================
CREATE OR REPLACE PROCEDURE public.provision_admin_user(
  p_email TEXT,
  p_name TEXT,
  p_department TEXT DEFAULT 'Campus Administration'
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Look up user ID from auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % must register in Supabase Auth before admin role can be assigned.', p_email;
  END IF;

  -- Upsert profile with admin privileges
  INSERT INTO public.profiles (id, name, email, role, department, verification_status, verified)
  VALUES (v_user_id, p_name, p_email, 'admin', p_department, 'approved', TRUE)
  ON CONFLICT (id) DO UPDATE
  SET role = 'admin',
      verification_status = 'approved',
      verified = TRUE,
      updated_at = NOW();

  -- Record in audit log
  INSERT INTO public.audit_logs (actor_name, actor_role, action, details)
  VALUES ('SYSTEM_PROVISIONER', 'system', 'ADMIN_PROVISIONED', 'Admin role assigned to ' || p_email);
END;
$$;
