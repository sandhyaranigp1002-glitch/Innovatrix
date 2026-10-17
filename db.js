import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'college_lms.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode and foreign keys for durability and performance
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  -- 1. Users table (Students, Tutors, Admins)
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    prn TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'tutor', 'admin')),
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  -- 2. Tutors table
  CREATE TABLE IF NOT EXISTS tutors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    email TEXT,
    department TEXT NOT NULL DEFAULT 'Computer Science and Engineering (CSE)',
    experience_years INTEGER NOT NULL DEFAULT 3,
    rating REAL NOT NULL DEFAULT 4.9,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  -- 3. Subjects table
  CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    tutor_name TEXT,
    created_at TEXT NOT NULL
  );

  -- 4. Online Lecture Sessions table
  CREATE TABLE IF NOT EXISTS online_sessions (
    id TEXT PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    tutor_name TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    meeting_link TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Live', 'Completed', 'Cancelled', 'Recording Available')) DEFAULT 'Scheduled',
    recording_url TEXT,
    created_by TEXT,
    created_at TEXT NOT NULL
  );

  -- 5. Recorded Lectures table
  CREATE TABLE IF NOT EXISTS recorded_lectures (
    id TEXT PRIMARY KEY,
    lecture_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    tutor_name TEXT NOT NULL,
    department TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    semester TEXT NOT NULL,
    lecture_date TEXT NOT NULL,
    duration TEXT NOT NULL,
    recording_url TEXT NOT NULL,
    description TEXT,
    related_session_id TEXT,
    status TEXT NOT NULL DEFAULT 'Available',
    created_at TEXT NOT NULL
  );

  -- 6. College Info & Leadership
  CREATE TABLE IF NOT EXISTS college_info (
    id TEXT PRIMARY KEY,
    institution_name TEXT NOT NULL,
    principal_designation TEXT NOT NULL,
    principal_name TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  -- 7. Sessions / Auth tokens table
  CREATE TABLE IF NOT EXISTS auth_sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

// Password hashing helper
export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, hash, salt) {
  const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return testHash === hash;
}

// Seed essential initial configuration (Principal, Admin, and 4 mandatory Tutors)
function seedInitialData() {
  // 1. College Leadership / Principal Info
  const collegeInfoCheck = db.prepare('SELECT id FROM college_info WHERE id = ?').get('college_main');
  if (!collegeInfoCheck) {
    db.prepare(`
      INSERT INTO college_info (id, institution_name, principal_designation, principal_name, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      'college_main',
      'BrainBridge College of Engineering & Technology',
      'Principal',
      'Dr. Suhas Sapate Sir',
      new Date().toISOString()
    );
  }

  // 2. Default Administrator
  const adminCheck = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@brainbridge.edu');
  if (!adminCheck) {
    const { hash, salt } = hashPassword('admin123');
    db.prepare(`
      INSERT INTO users (id, name, email, prn, password_hash, salt, role, department, academic_year, semester, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      'user_admin_001',
      'Campus Administrator',
      'admin@brainbridge.edu',
      'FAC-AUTH-001',
      hash,
      salt,
      'admin',
      'Administration',
      'Faculty',
      'N/A',
      new Date().toISOString()
    );
  }

  // 3. Mandatory 4 Tutors (Sr. No. 1 to 4)
  const tutorsToSeed = [
    { id: 'tutor_1', name: 'Sandhyarani Patil', subject: 'DSA', email: 'sandhyarani.patil@brainbridge.edu', dept: 'Computer Science and Engineering (CSE)' },
    { id: 'tutor_2', name: 'Rutuja Gaikwad', subject: 'Java', email: 'rutuja.gaikwad@brainbridge.edu', dept: 'Computer Science and Engineering (CSE)' },
    { id: 'tutor_3', name: 'Vivek Utturkar', subject: 'Python', email: 'vivek.utturkar@brainbridge.edu', dept: 'Information Technology (IT)' },
    { id: 'tutor_4', name: 'Rohan Patil', subject: 'DBMS', email: 'rohan.patil@brainbridge.edu', dept: 'Computer Science and Engineering (CSE)' },
  ];

  for (const t of tutorsToSeed) {
    const existing = db.prepare('SELECT id FROM tutors WHERE name = ?').get(t.name);
    if (!existing) {
      db.prepare(`
        INSERT INTO tutors (id, name, subject, email, department, experience_years, rating, is_active, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(t.id, t.name, t.subject, t.email, t.dept, 4, 4.9, 1, new Date().toISOString());
    }
  }

  // 4. Corresponding Subjects
  const subjectsToSeed = [
    { id: 'subj_1', code: 'CS301', name: 'DSA (Data Structures and Algorithms)', department: 'Computer Science and Engineering (CSE)', academic_year: 'Second Year', semester: 'Semester 3', tutor_name: 'Sandhyarani Patil' },
    { id: 'subj_2', code: 'CS302', name: 'Java (Object Oriented Programming with Java)', department: 'Computer Science and Engineering (CSE)', academic_year: 'Second Year', semester: 'Semester 4', tutor_name: 'Rutuja Gaikwad' },
    { id: 'subj_3', code: 'IT201', name: 'Python (Python Programming & Scripting)', department: 'Information Technology (IT)', academic_year: 'First Year', semester: 'Semester 2', tutor_name: 'Vivek Utturkar' },
    { id: 'subj_4', code: 'CS401', name: 'DBMS (Database Management Systems)', department: 'Computer Science and Engineering (CSE)', academic_year: 'Third Year', semester: 'Semester 5', tutor_name: 'Rohan Patil' },
  ];

  for (const s of subjectsToSeed) {
    const existing = db.prepare('SELECT id FROM subjects WHERE code = ?').get(s.code);
    if (!existing) {
      db.prepare(`
        INSERT INTO subjects (id, code, name, department, academic_year, semester, tutor_name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(s.id, s.code, s.name, s.department, s.academic_year, s.semester, s.tutor_name, new Date().toISOString());
    }
  }

  // 5. Initial Online Lecture Sessions
  const sessionCheck = db.prepare('SELECT COUNT(*) as count FROM online_sessions').get();
  if (sessionCheck.count === 0) {
    const initialSessions = [
      {
        id: 'sess_db_001',
        session_id: 'SESS-2025-0101',
        title: 'Binary Search Trees & AVL Rotations Masterclass',
        subject: 'DSA',
        tutor_name: 'Sandhyarani Patil',
        department: 'Computer Science and Engineering (CSE)',
        academic_year: 'Second Year',
        semester: 'Semester 3',
        scheduled_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        start_time: '10:00 AM',
        end_time: '11:30 AM',
        meeting_link: 'https://meet.google.com/dsa-avl-tree',
        status: 'Scheduled',
        recording_url: null,
      },
      {
        id: 'sess_db_002',
        session_id: 'SESS-2025-0102',
        title: 'Database Normalization & BCNF Decomposition',
        subject: 'DBMS',
        tutor_name: 'Rohan Patil',
        department: 'Computer Science and Engineering (CSE)',
        academic_year: 'Third Year',
        semester: 'Semester 5',
        scheduled_date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        start_time: '02:00 PM',
        end_time: '03:30 PM',
        meeting_link: 'https://meet.google.com/dbms-bcnf-decom',
        status: 'Scheduled',
        recording_url: null,
      },
      {
        id: 'sess_db_003',
        session_id: 'SESS-2025-0103',
        title: 'Python Data Structures & List Comprehensions',
        subject: 'Python',
        tutor_name: 'Vivek Utturkar',
        department: 'Information Technology (IT)',
        academic_year: 'First Year',
        semester: 'Semester 2',
        scheduled_date: new Date().toISOString().split('T')[0],
        start_time: '04:00 PM',
        end_time: '05:00 PM',
        meeting_link: 'https://meet.google.com/python-comprehensions',
        status: 'Live',
        recording_url: null,
      }
    ];

    for (const sess of initialSessions) {
      db.prepare(`
        INSERT INTO online_sessions (
          id, session_id, title, subject, tutor_name, department, academic_year, semester,
          scheduled_date, start_time, end_time, meeting_link, status, recording_url, created_by, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        sess.id,
        sess.session_id,
        sess.title,
        sess.subject,
        sess.tutor_name,
        sess.department,
        sess.academic_year,
        sess.semester,
        sess.scheduled_date,
        sess.start_time,
        sess.end_time,
        sess.meeting_link,
        sess.status,
        sess.recording_url,
        'user_admin_001',
        new Date().toISOString()
      );
    }
  }

  // 6. Initial Recorded Lectures
  const lectureCheck = db.prepare('SELECT COUNT(*) as count FROM recorded_lectures').get();
  if (lectureCheck.count === 0) {
    const initialLectures = [
      {
        id: 'rec_db_001',
        lecture_id: 'LEC-DSA-101',
        title: 'Asymptotic Analysis & Big-O Notation Fundamentals',
        subject: 'DSA',
        tutor_name: 'Sandhyarani Patil',
        department: 'Computer Science and Engineering (CSE)',
        academic_year: 'Second Year',
        semester: 'Semester 3',
        lecture_date: '2025-02-10',
        duration: '52 mins',
        recording_url: 'https://www.youtube.com/watch?v=D6xkbGLQesk',
        description: 'Comprehensive analysis of time and space complexity with recurrence relations and master theorem applications.',
        status: 'Available'
      },
      {
        id: 'rec_db_002',
        lecture_id: 'LEC-JAVA-201',
        title: 'Java Exception Handling & Robust Multithreading',
        subject: 'Java',
        tutor_name: 'Rutuja Gaikwad',
        department: 'Computer Science and Engineering (CSE)',
        academic_year: 'Second Year',
        semester: 'Semester 4',
        lecture_date: '2025-02-12',
        duration: '58 mins',
        recording_url: 'https://www.youtube.com/watch?v=grEKMHGYyns',
        description: 'Deep dive into checked vs unchecked exceptions, try-with-resources, synchronization, and thread lifecycle in Java.',
        status: 'Available'
      },
      {
        id: 'rec_db_003',
        lecture_id: 'LEC-PY-301',
        title: 'Python Object-Oriented Programming & Custom Decorators',
        subject: 'Python',
        tutor_name: 'Vivek Utturkar',
        department: 'Information Technology (IT)',
        academic_year: 'First Year',
        semester: 'Semester 2',
        lecture_date: '2025-02-14',
        duration: '45 mins',
        recording_url: 'https://www.youtube.com/watch?v=JeznW_7DlB0',
        description: 'Classes, dunder methods, inheritance, polymorphism, and functional decorators in Python with interactive demonstrations.',
        status: 'Available'
      },
      {
        id: 'rec_db_004',
        lecture_id: 'LEC-DBMS-401',
        title: 'Relational Algebra & Advanced SQL Query Optimization',
        subject: 'DBMS',
        tutor_name: 'Rohan Patil',
        department: 'Computer Science and Engineering (CSE)',
        academic_year: 'Third Year',
        semester: 'Semester 5',
        lecture_date: '2025-02-15',
        duration: '60 mins',
        recording_url: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        description: 'Join algorithms, query execution plans, B+ tree indexing strategies, and transaction isolation levels in PostgreSQL.',
        status: 'Available'
      }
    ];

    for (const lec of initialLectures) {
      db.prepare(`
        INSERT INTO recorded_lectures (
          id, lecture_id, title, subject, tutor_name, department, academic_year, semester,
          lecture_date, duration, recording_url, description, related_session_id, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        lec.id,
        lec.lecture_id,
        lec.title,
        lec.subject,
        lec.tutor_name,
        lec.department,
        lec.academic_year,
        lec.semester,
        lec.lecture_date,
        lec.duration,
        lec.recording_url,
        lec.description,
        null,
        lec.status,
        new Date().toISOString()
      );
    }
  }
}

seedInitialData();

export { db };
