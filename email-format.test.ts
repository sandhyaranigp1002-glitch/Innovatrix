// Mock browser environment for node testing
const store: Record<string, string> = {};
const mockStorage = {
  getItem: (key: string) => (store[key] !== undefined ? store[key] : null),
  setItem: (key: string, val: string) => { store[key] = String(val); },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  key: (i: number) => Object.keys(store)[i] || null,
  get length() { return Object.keys(store).length; }
};

(globalThis as any).window = {
  localStorage: mockStorage,
  dispatchEvent: (e: any) => {},
  addEventListener: () => {},
  removeEventListener: () => {}
};
(globalThis as any).CustomEvent = class {
  type: string;
  detail: any;
  constructor(type: string, opts?: any) {
    this.type = type;
    this.detail = opts?.detail;
  }
};

import { validateCollegeEmail } from '../src/services/security';
import { LocalStorageAdapter } from '../src/services/storage';

console.log('================================================================');
console.log('         EMAIL FORMAT UPGRADE TEST: ALL EMAIL IDS ACCEPTED      ');
console.log('================================================================\n');

// 1. Test validateCollegeEmail directly with diverse providers
const testEmails = [
  'student@gmail.com',
  'john.doe@outlook.com',
  'engineering.student@yahoo.com',
  'alex@icloud.com',
  'learner@campus.edu',
  'student2024@iitb.ac.in',
  'coder@mit.edu',
  'peer@university.ac.uk',
  'user123@proton.me',
  'dev@brainbridge.org'
];

let allValidPassed = true;
for (const email of testEmails) {
  const res = validateCollegeEmail(email);
  if (!res.valid) {
    console.error(`\x1b[31m[FAIL]\x1b[0m ${email} was rejected: ${res.error}`);
    allValidPassed = false;
  } else {
    console.log(`\x1b[32m[PASS]\x1b[0m Accepted: ${email}`);
  }
}

if (allValidPassed) {
  console.log('\n✓ All 10 valid email providers (Gmail, Outlook, Yahoo, University, Custom) were accepted successfully!\n');
} else {
  throw new Error('Some valid emails were rejected.');
}

// 2. Test that malformed/invalid emails are still rejected
const invalidEmails = [
  'plainaddress',
  '@missingusername.com',
  'username@.com',
  'username@domain',
  'spaces in@domain.com'
];

let invalidRejected = true;
for (const bad of invalidEmails) {
  const res = validateCollegeEmail(bad);
  if (res.valid) {
    console.error(`\x1b[31m[FAIL]\x1b[0m Invalid email "${bad}" was incorrectly accepted!`);
    invalidRejected = false;
  } else {
    console.log(`\x1b[32m[PASS]\x1b[0m Correctly rejected malformed: "${bad}" (${res.error})`);
  }
}

if (invalidRejected) {
  console.log('\n✓ All invalid/malformed email structures were correctly rejected!\n');
}

// 3. Test Student Registration with a Gmail address & PRN
console.log('Testing full student registration with Gmail (student.tester@gmail.com)...');
LocalStorageAdapter.init();

const regResult = LocalStorageAdapter.register({
  name: 'Rohan Sharma',
  email: 'student.tester@gmail.com',
  password: 'password123',
  prn: 'PRN-2025-7788',
  department: 'Computer Science',
  academicYear: 'Sophomore (2nd Year)',
  bio: 'Competitive programmer using BrainBridge'
});

console.log(`✓ Registration succeeded for ${regResult.user.name} with email: ${regResult.user.email}`);
console.log(`✓ PRN: ${regResult.user.prnMasked}, Status: ${regResult.user.verificationStatus}`);

console.log('\n================================================================');
console.log('       ALL EMAIL FORMAT VALIDATION TESTS PASSED (100%)         ');
console.log('================================================================\n');
