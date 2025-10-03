import React, { useState } from 'react';
import StudentProfileForm from './components/profile/StudentProfileForm.jsx';
import AlumniProfileForm from './components/profile/AlumniProfileForm.jsx';
import VerificationStatus from './components/profile/VerificationStatus.jsx';

export default function App() {
  const [role, setRole] = useState('student');

  return (
    <div className="container">
      <header className="header">
        <h1>Alumni Platform</h1>
        <div className="role-switcher">
          <label>
            <span>Role:</span>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="student">Student</option>
              <option value="alumni">Alumni</option>
            </select>
          </label>
        </div>
      </header>

      <section className="content">
        <VerificationStatus />
        {role === 'student' ? <StudentProfileForm /> : <AlumniProfileForm />}
      </section>
    </div>
  );
}
