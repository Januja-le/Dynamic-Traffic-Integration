import React from 'react';

export default function VerificationStatus({ status = 'pending' }) {
  const label = status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2>Verification</h2>
        <span className={`badge ${status}`}>{label}</span>
      </div>
      <p className="small">
        Admins review profiles. Status changes to <b>approved</b> when verified. If rejected,
        you can update information and resubmit.
      </p>
    </div>
  );
}
