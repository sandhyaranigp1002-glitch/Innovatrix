// Frontend API Client connecting directly to persistent SQLite Backend

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  prn: string;
  role: 'student' | 'tutor' | 'admin';
  department: string;
  academic_year: string;
  semester?: string;
  bio?: string;
  avatar?: string;
  xp?: number;
  created_at?: string;
}

export interface CollegeInfo {
  id: string;
  institution_name: string;
  principal_designation: string;
  principal_name: string;
  updated_at?: string;
}

export interface TutorRecord {
  id: string;
  name: string;
  subject: string;
  email: string;
  department: string;
  experience_years: number;
  rating: number;
  is_active: number | boolean;
  created_at?: string;
}

export interface SubjectRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: string;
  credits: number;
}

export interface OnlineSessionRecord {
  id: string;
  session_id: string;
  title: string;
  subject: string;
  tutor_name: string;
  department: string;
  academic_year: string;
  semester: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  status: 'Scheduled' | 'Live' | 'Completed' | 'Cancelled' | 'Recording Available';
  recording_url?: string;
  created_by?: string;
  created_at?: string;
}

export interface RecordedLectureRecord {
  id: string;
  lecture_id: string;
  title: string;
  subject: string;
  tutor_name: string;
  department: string;
  academic_year: string;
  semester: string;
  lecture_date: string;
  duration_minutes: number;
  video_url: string;
  description?: string;
  session_id?: string;
  status?: string;
  created_at?: string;
}

export interface AdminStats {
  totalStudents: number;
  totalTutors: number;
  totalSubjects: number;
  totalSessions: number;
  totalRecordings: number;
  departmentStats: { department: string; count: number }[];
  yearStats: { academic_year: string; count: number }[];
}

const TOKEN_KEY = 'college_lms_auth_token';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  // Auth endpoints
  async register(studentData: {
    name: string;
    email: string;
    prn: string;
    password: string;
    confirmPassword?: string;
    department: string;
    academicYear: string;
    semester?: string;
    bio?: string;
  }): Promise<{ success: boolean; message: string; data: { id: string; name: string; email: string; prn: string } }> {
    return request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async login(email: string, password: string): Promise<{ success: boolean; token: string; user: ApiUser }> {
    const res = await request<{ success: boolean; token: string; user: ApiUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.token) {
      this.setToken(res.token);
    }
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore network errors on logout
    } finally {
      this.clearToken();
    }
  },

  async getCurrentUser(): Promise<ApiUser | null> {
    const token = this.getToken();
    if (!token) return null;
    try {
      const res = await request<{ success: boolean; user: ApiUser }>('/api/auth/me');
      return res.user || null;
    } catch (e) {
      this.clearToken();
      return null;
    }
  },

  // College Info
  async getCollegeInfo(): Promise<CollegeInfo> {
    const res = await request<{ success: boolean; data: CollegeInfo }>('/api/college-info');
    return res.data;
  },

  // Tutors
  async getTutors(): Promise<TutorRecord[]> {
    const res = await request<{ success: boolean; data: TutorRecord[] }>('/api/tutors');
    return res.data;
  },

  async createTutor(tutor: {
    name: string;
    subject: string;
    email?: string;
    department?: string;
    experience_years?: number;
    rating?: number;
  }): Promise<TutorRecord> {
    const res = await request<{ success: boolean; data: TutorRecord }>('/api/tutors', {
      method: 'POST',
      body: JSON.stringify(tutor),
    });
    return res.data;
  },

  async updateTutor(id: string, tutor: Partial<TutorRecord>): Promise<TutorRecord> {
    const res = await request<{ success: boolean; data: TutorRecord }>(`/api/tutors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tutor),
    });
    return res.data;
  },

  async deleteTutor(id: string): Promise<void> {
    await request(`/api/tutors/${id}`, { method: 'DELETE' });
  },

  // Subjects
  async getSubjects(department?: string): Promise<SubjectRecord[]> {
    const query = department ? `?department=${encodeURIComponent(department)}` : '';
    const res = await request<{ success: boolean; data: SubjectRecord[] }>(`/api/subjects${query}`);
    return res.data;
  },

  // Online Lecture Sessions
  async getSessions(params: { department?: string; academic_year?: string } = {}): Promise<OnlineSessionRecord[]> {
    const searchParams = new URLSearchParams();
    if (params.department) searchParams.append('department', params.department);
    if (params.academic_year) searchParams.append('academic_year', params.academic_year);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await request<{ success: boolean; data: OnlineSessionRecord[] }>(`/api/sessions${query}`);
    return res.data;
  },

  async createSession(sessionData: {
    title: string;
    subject: string;
    tutor_name: string;
    department: string;
    academic_year: string;
    semester?: string;
    scheduled_date: string;
    start_time: string;
    end_time: string;
    meeting_link: string;
    status?: string;
    recording_url?: string;
  }): Promise<OnlineSessionRecord> {
    const res = await request<{ success: boolean; data: OnlineSessionRecord }>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
    return res.data;
  },

  async updateSession(id: string, updateData: Partial<OnlineSessionRecord>): Promise<OnlineSessionRecord> {
    const res = await request<{ success: boolean; data: OnlineSessionRecord }>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    return res.data;
  },

  // Recorded Lectures
  async getRecordedLectures(params: {
    department?: string;
    academic_year?: string;
    subject?: string;
    tutor?: string;
    search?: string;
  } = {}): Promise<RecordedLectureRecord[]> {
    const searchParams = new URLSearchParams();
    if (params.department) searchParams.append('department', params.department);
    if (params.academic_year) searchParams.append('academic_year', params.academic_year);
    if (params.subject) searchParams.append('subject', params.subject);
    if (params.tutor) searchParams.append('tutor', params.tutor);
    if (params.search) searchParams.append('search', params.search);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await request<{ success: boolean; data: RecordedLectureRecord[] }>(`/api/recorded-lectures${query}`);
    return res.data;
  },

  async createRecordedLecture(lectureData: {
    title: string;
    subject: string;
    tutor_name: string;
    department: string;
    academic_year: string;
    semester?: string;
    lecture_date: string;
    duration_minutes: number;
    video_url: string;
    description?: string;
    session_id?: string;
  }): Promise<RecordedLectureRecord> {
    const res = await request<{ success: boolean; data: RecordedLectureRecord }>('/api/recorded-lectures', {
      method: 'POST',
      body: JSON.stringify(lectureData),
    });
    return res.data;
  },

  // Admin Portal endpoints
  async getAdminStudents(): Promise<ApiUser[]> {
    const res = await request<{ success: boolean; data: ApiUser[] }>('/api/admin/students');
    return res.data;
  },

  async getAdminStats(): Promise<AdminStats> {
    const res = await request<{ success: boolean; data: AdminStats }>('/api/admin/stats');
    return res.data;
  },
};
