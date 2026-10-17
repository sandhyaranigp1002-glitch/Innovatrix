import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import { db, hashPassword, verifyPassword } from './db.js';

const app = express();

app.use(cors());
app.use(express.json());

// Auth helper middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required.' });
  }

  const session = db.prepare(`
    SELECT s.token, s.user_id, s.expires_at, u.id, u.name, u.email, u.prn, u.role, u.department, u.academic_year, u.semester
    FROM auth_sessions s
    JOIN users u ON s.user_id = u.id
    WHERE s.token = ?
  `).get(token);

  if (!session) {
    return res.status(403).json({ error: 'Invalid or expired session. Please log in again.' });
  }

  if (new Date(session.expires_at) < new Date()) {
    db.prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
    return res.status(403).json({ error: 'Session expired. Please log in again.' });
  }

  req.user = session;
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

// -------------------------------------------------------------
// 1. AUTHENTICATION & REGISTRATION ENDPOINTS
// -------------------------------------------------------------

// Student Registration
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      name,
      email,
      prn,
      password,
      confirmPassword,
      department,
      academicYear,
      semester,
    } = req.body;

    // 1. Field validation
    if (!name?.trim() || !email?.trim() || !prn?.trim() || !password || !confirmPassword || !department || !academicYear) {
      return res.status(400).json({ error: 'All fields are required. Please complete all form inputs.' });
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }

    // 3. Password match validation
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPRN = prn.trim().toUpperCase();

    // 4. Duplicate Email check
    const existingEmail = db.prepare('SELECT id FROM users WHERE email = ?').get(cleanEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'An account with this email address is already registered.' });
    }

    // 5. Duplicate PRN check
    const existingPRN = db.prepare('SELECT id FROM users WHERE prn = ?').get(cleanPRN);
    if (existingPRN) {
      return res.status(400).json({ error: 'A student with this Student ID / PRN is already registered.' });
    }

    // 6. Secure password hashing
    const { hash, salt } = hashPassword(password);
    const userId = `std_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const sem = semester || 'Semester 1';

    db.prepare(`
      INSERT INTO users (id, name, email, prn, password_hash, salt, role, department, academic_year, semester, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      name.trim(),
      cleanEmail,
      cleanPRN,
      hash,
      salt,
      'student',
      department,
      academicYear,
      sem,
      new Date().toISOString()
    );

    // Note: Do NOT automatically log in the student. Redirect to Login page per Requirement 2.
    return res.status(201).json({
      success: true,
      message: 'Registration successful! Please sign in with your email and password.',
      email: cleanEmail
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate session token (valid for 7 days)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO auth_sessions (token, user_id, expires_at, created_at)
      VALUES (?, ?, ?, ?)
    `).run(token, user.id, expiresAt, new Date().toISOString());

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        prn: user.prn,
        role: user.role,
        department: user.department,
        academic_year: user.academic_year,
        semester: user.semester
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token) {
      db.prepare('DELETE FROM auth_sessions WHERE token = ?').run(token);
    }
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error during logout.' });
  }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, (req, res) => {
  return res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      prn: req.user.prn,
      role: req.user.role,
      department: req.user.department,
      academic_year: req.user.academic_year,
      semester: req.user.semester
    }
  });
});

// -------------------------------------------------------------
// 2. COLLEGE INFO & LEADERSHIP (PRINCIPAL INFORMATION)
// -------------------------------------------------------------

app.get('/api/college-info', (req, res) => {
  try {
    const info = db.prepare('SELECT * FROM college_info WHERE id = ?').get('college_main');
    return res.json({
      success: true,
      data: info || {
        institution_name: 'BrainBridge College of Engineering & Technology',
        principal_designation: 'Principal',
        principal_name: 'Dr. Suhas Sapate Sir',
      }
    });
  } catch (err) {
    console.error('Error fetching college info:', err);
    return res.status(500).json({ error: 'Could not fetch college information.' });
  }
});

// -------------------------------------------------------------
// 3. TUTOR MANAGEMENT & SUBJECTS
// -------------------------------------------------------------

app.get('/api/tutors', (req, res) => {
  try {
    const tutors = db.prepare('SELECT * FROM tutors ORDER BY name ASC').all();
    return res.json({ success: true, data: tutors });
  } catch (err) {
    console.error('Error fetching tutors:', err);
    return res.status(500).json({ error: 'Could not fetch tutors.' });
  }
});

app.post('/api/tutors', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, subject, email, department, experience_years } = req.body;
    if (!name?.trim() || !subject?.trim()) {
      return res.status(400).json({ error: 'Tutor name and subject are required.' });
    }

    const id = `tutor_${Date.now()}`;
    db.prepare(`
      INSERT INTO tutors (id, name, subject, email, department, experience_years, rating, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      name.trim(),
      subject.trim(),
      email?.trim() || '',
      department?.trim() || 'Computer Science and Engineering (CSE)',
      Number(experience_years) || 3,
      4.9,
      1,
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM tutors WHERE id = ?').get(id);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error adding tutor:', err);
    return res.status(500).json({ error: 'Could not add tutor.' });
  }
});

app.put('/api/tutors/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject, email, department, is_active } = req.body;

    db.prepare(`
      UPDATE tutors
      SET name = COALESCE(?, name),
          subject = COALESCE(?, subject),
          email = COALESCE(?, email),
          department = COALESCE(?, department),
          is_active = COALESCE(?, is_active)
      WHERE id = ?
    `).run(name, subject, email, department, is_active, id);

    const updated = db.prepare('SELECT * FROM tutors WHERE id = ?').get(id);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating tutor:', err);
    return res.status(500).json({ error: 'Could not update tutor.' });
  }
});

app.delete('/api/tutors/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    db.prepare('DELETE FROM tutors WHERE id = ?').run(id);
    return res.json({ success: true, message: 'Tutor deleted successfully.' });
  } catch (err) {
    console.error('Error deleting tutor:', err);
    return res.status(500).json({ error: 'Could not delete tutor.' });
  }
});

app.get('/api/subjects', (req, res) => {
  try {
    const subjects = db.prepare('SELECT * FROM subjects ORDER BY code ASC').all();
    return res.json({ success: true, data: subjects });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    return res.status(500).json({ error: 'Could not fetch subjects.' });
  }
});

// -------------------------------------------------------------
// 4. ONLINE LECTURE SESSIONS (AUTOMATIC SESSION ID GENERATION)
// -------------------------------------------------------------

app.get('/api/sessions', (req, res) => {
  try {
    const { department, academic_year, status } = req.query;
    let query = 'SELECT * FROM online_sessions WHERE 1=1';
    const params = [];

    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (academic_year && academic_year !== 'All') {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (status && status !== 'All') {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY scheduled_date ASC, start_time ASC';
    const sessions = db.prepare(query).all(...params);
    return res.json({ success: true, data: sessions });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return res.status(500).json({ error: 'Could not fetch online sessions.' });
  }
});

// Create new online session (automatic unique Session ID)
app.post('/api/sessions', authenticateToken, (req, res) => {
  try {
    const {
      title,
      subject,
      tutor_name,
      department,
      academic_year,
      semester,
      scheduled_date,
      start_time,
      end_time,
      meeting_link
    } = req.body;

    if (!title || !subject || !tutor_name || !department || !academic_year || !scheduled_date || !start_time || !end_time || !meeting_link) {
      return res.status(400).json({ error: 'All lecture session details and meeting link are required.' });
    }

    // Auto-generate Unique Session ID (Requirement 9)
    const sessionCodeNumber = Math.floor(1000 + Math.random() * 9000);
    const autoSessionId = `SESS-2025-${sessionCodeNumber}`;
    const id = `sess_${Date.now()}`;

    db.prepare(`
      INSERT INTO online_sessions (
        id, session_id, title, subject, tutor_name, department, academic_year, semester,
        scheduled_date, start_time, end_time, meeting_link, status, recording_url, created_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      autoSessionId,
      title.trim(),
      subject.trim(),
      tutor_name.trim(),
      department.trim(),
      academic_year.trim(),
      semester?.trim() || 'Semester 1',
      scheduled_date,
      start_time,
      end_time,
      meeting_link.trim(),
      'Scheduled',
      null,
      req.user.id,
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM online_sessions WHERE id = ?').get(id);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error creating online session:', err);
    return res.status(500).json({ error: 'Could not create online session.' });
  }
});

// Update session status / attach recording
app.put('/api/sessions/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, recording_url } = req.body;

    const existing = db.prepare('SELECT * FROM online_sessions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    db.prepare(`
      UPDATE online_sessions
      SET status = COALESCE(?, status),
          recording_url = COALESCE(?, recording_url)
      WHERE id = ?
    `).run(status, recording_url, id);

    // If recording was attached and status is Completed, make sure it is added to recorded_lectures
    if (recording_url && (status === 'Completed' || status === 'Recording Available')) {
      const existingLecture = db.prepare('SELECT id FROM recorded_lectures WHERE related_session_id = ?').get(id);
      if (!existingLecture) {
        const lectureId = `LEC-${existing.session_id.replace('SESS-', '')}`;
        db.prepare(`
          INSERT INTO recorded_lectures (
            id, lecture_id, title, subject, tutor_name, department, academic_year, semester,
            lecture_date, duration, recording_url, description, related_session_id, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          `rec_${Date.now()}`,
          lectureId,
          existing.title,
          existing.subject,
          existing.tutor_name,
          existing.department,
          existing.academic_year,
          existing.semester,
          existing.scheduled_date,
          '60 mins',
          recording_url,
          `Recorded session from ${existing.title} held on ${existing.scheduled_date}.`,
          id,
          'Available',
          new Date().toISOString()
        );
      }
    }

    const updated = db.prepare('SELECT * FROM online_sessions WHERE id = ?').get(id);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updating session:', err);
    return res.status(500).json({ error: 'Could not update session.' });
  }
});

// Dedicated endpoint to attach recording
app.patch('/api/sessions/:id/recording', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { recording_url } = req.body;
    if (!recording_url?.trim()) {
      return res.status(400).json({ error: 'Recording URL is required.' });
    }

    const existing = db.prepare('SELECT * FROM online_sessions WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Session not found.' });
    }

    db.prepare(`
      UPDATE online_sessions
      SET recording_url = ?,
          status = 'Recording Available'
      WHERE id = ?
    `).run(recording_url.trim(), id);

    // Auto-create recorded lecture entry if not already exists
    const existingLecture = db.prepare('SELECT id FROM recorded_lectures WHERE related_session_id = ?').get(id);
    if (!existingLecture) {
      const lectureId = `LEC-${existing.session_id.replace('SESS-', '')}`;
      db.prepare(`
        INSERT INTO recorded_lectures (
          id, lecture_id, title, subject, tutor_name, department, academic_year, semester,
          lecture_date, duration, recording_url, description, related_session_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `rec_${Date.now()}`,
        lectureId,
        existing.title,
        existing.subject,
        existing.tutor_name,
        existing.department,
        existing.academic_year,
        existing.semester,
        existing.scheduled_date,
        '60 mins',
        recording_url.trim(),
        `Recorded lecture for ${existing.title}.`,
        id,
        'Available',
        new Date().toISOString()
      );
    }

    const updated = db.prepare('SELECT * FROM online_sessions WHERE id = ?').get(id);
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error attaching recording:', err);
    return res.status(500).json({ error: 'Could not attach recording.' });
  }
});

// -------------------------------------------------------------
// 5. RECORDED LECTURES MODULE
// -------------------------------------------------------------

app.get('/api/recorded-lectures', (req, res) => {
  try {
    const { department, academic_year, semester, subject, tutor, search } = req.query;
    let query = 'SELECT * FROM recorded_lectures WHERE 1=1';
    const params = [];

    if (department && department !== 'All') {
      query += ' AND department = ?';
      params.push(department);
    }
    if (academic_year && academic_year !== 'All') {
      query += ' AND academic_year = ?';
      params.push(academic_year);
    }
    if (semester && semester !== 'All') {
      query += ' AND semester = ?';
      params.push(semester);
    }
    if (subject && subject !== 'All') {
      query += ' AND subject = ?';
      params.push(subject);
    }
    if (tutor && tutor !== 'All') {
      query += ' AND tutor_name = ?';
      params.push(tutor);
    }
    if (search && search.trim()) {
      query += ' AND (title LIKE ? OR description LIKE ? OR subject LIKE ? OR tutor_name LIKE ?)';
      const s = `%${search.trim()}%`;
      params.push(s, s, s, s);
    }

    query += ' ORDER BY lecture_date DESC';
    const lectures = db.prepare(query).all(...params);
    return res.json({ success: true, data: lectures });
  } catch (err) {
    console.error('Error fetching recorded lectures:', err);
    return res.status(500).json({ error: 'Could not fetch recorded lectures.' });
  }
});

app.post('/api/recorded-lectures', authenticateToken, (req, res) => {
  try {
    const {
      title,
      subject,
      tutor_name,
      department,
      academic_year,
      semester,
      lecture_date,
      duration,
      recording_url,
      description,
      related_session_id
    } = req.body;

    if (!title || !subject || !tutor_name || !department || !academic_year || !recording_url) {
      return res.status(400).json({ error: 'Title, subject, tutor, department, academic year, and recording URL are required.' });
    }

    const lecCode = Math.floor(100 + Math.random() * 900);
    const lectureId = `LEC-${subject.toUpperCase().slice(0, 3)}-${lecCode}`;
    const id = `rec_${Date.now()}`;

    db.prepare(`
      INSERT INTO recorded_lectures (
        id, lecture_id, title, subject, tutor_name, department, academic_year, semester,
        lecture_date, duration, recording_url, description, related_session_id, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      lectureId,
      title.trim(),
      subject.trim(),
      tutor_name.trim(),
      department.trim(),
      academic_year.trim(),
      semester?.trim() || 'Semester 1',
      lecture_date || new Date().toISOString().split('T')[0],
      duration?.trim() || '45 mins',
      recording_url.trim(),
      description?.trim() || '',
      related_session_id || null,
      'Available',
      new Date().toISOString()
    );

    const created = db.prepare('SELECT * FROM recorded_lectures WHERE id = ?').get(id);
    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error adding recorded lecture:', err);
    return res.status(500).json({ error: 'Could not add recorded lecture.' });
  }
});

// -------------------------------------------------------------
// 6. ADMIN DASHBOARD & STATISTICS
// -------------------------------------------------------------

app.get('/api/admin/students', authenticateToken, requireAdmin, (req, res) => {
  try {
    const students = db.prepare(`
      SELECT id, name, email, prn, role, department, academic_year, semester, created_at
      FROM users
      WHERE role = 'student'
      ORDER BY created_at DESC
    `).all();
    return res.json({ success: true, data: students });
  } catch (err) {
    console.error('Error fetching students:', err);
    return res.status(500).json({ error: 'Could not fetch students.' });
  }
});

app.get('/api/admin/stats', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'student'").get().count;
    const totalTutors = db.prepare('SELECT COUNT(*) as count FROM tutors WHERE is_active = 1').get().count;
    const totalSubjects = db.prepare('SELECT COUNT(*) as count FROM subjects').get().count;
    const totalSessions = db.prepare('SELECT COUNT(*) as count FROM online_sessions').get().count;
    const totalRecordedLectures = db.prepare('SELECT COUNT(*) as count FROM recorded_lectures').get().count;

    const deptRows = db.prepare(`
      SELECT department, COUNT(*) as count
      FROM users
      WHERE role = 'student'
      GROUP BY department
      ORDER BY count DESC
    `).all();

    const yearRows = db.prepare(`
      SELECT academic_year, COUNT(*) as count
      FROM users
      WHERE role = 'student'
      GROUP BY academic_year
      ORDER BY count DESC
    `).all();

    return res.json({
      success: true,
      data: {
        totalStudents,
        totalTutors,
        totalSubjects,
        totalSessions,
        totalRecordedLectures,
        totalRecordings: totalRecordedLectures,
        departmentStats: deptRows,
        academicYearStats: yearRows,
        yearStats: yearRows
      }
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ error: 'Could not fetch platform statistics.' });
  }
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled API Error:', err);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

export { app };

// If run directly (node server/server.js)
if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 College LMS Backend API listening on http://localhost:${PORT}`);
  });
}
