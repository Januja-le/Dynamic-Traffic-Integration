import React, { useState } from 'react';
import { saveProfile, uploadFiles } from '../../services/api';

export default function StudentProfileForm() {
  const [form, setForm] = useState({
    achievements: [''],
    internships: [{ company: '', role: '', durationMonths: '' }],
    events: [''],
    certificates: []
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const handleArrayChange = (field, index, value) => {
    const arr = [...form[field]];
    arr[index] = value;
    updateField(field, arr);
  };

  const addArrayItem = (field, emptyValue) => updateField(field, [...form[field], emptyValue]);
  const removeArrayItem = (field, index) => updateField(field, form[field].filter((_, i) => i !== index));

  const handleInternshipChange = (index, key, value) => {
    const arr = [...form.internships];
    arr[index] = { ...arr[index], [key]: value };
    updateField('internships', arr);
  };

  const onCertificatesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    try {
      // Replace endpoint with backend uploads route
      const resp = await uploadFiles('/users/upload-certificates', files);
      const urls = resp?.data?.files || [];
      updateField('certificates', [...form.certificates, ...urls]);
      setMessage('Certificates uploaded');
    } catch (err) {
      setMessage('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = {
        achievements: form.achievements.filter(Boolean),
        internships: form.internships.filter((i) => i.company || i.role),
        events: form.events.filter(Boolean),
        certificates: form.certificates
      };
      await saveProfile('student', payload);
      setMessage('Profile saved');
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Student Profile</h2>

      <div className="row" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
        <div className="field" style={{ gridColumn: 'span 12' }}>
          <label>Achievements</label>
          {form.achievements.map((ach, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="e.g., Hackathon Winner 2024"
                value={ach}
                onChange={(e) => handleArrayChange('achievements', idx, e.target.value)}
              />
              <button type="button" className="secondary" onClick={() => removeArrayItem('achievements', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('achievements', '')}>Add Achievement</button>
        </div>

        <div className="field" style={{ gridColumn: 'span 12' }}>
          <label>Internships</label>
          {form.internships.map((it, idx) => (
            <div key={idx} className="row" style={{ gridTemplateColumns: 'repeat(12, 1fr)', marginBottom: 8 }}>
              <div className="field" style={{ gridColumn: 'span 4' }}>
                <input placeholder="Company" value={it.company} onChange={(e) => handleInternshipChange(idx, 'company', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: 'span 4' }}>
                <input placeholder="Role" value={it.role} onChange={(e) => handleInternshipChange(idx, 'role', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: 'span 3' }}>
                <input type="number" placeholder="Duration (months)" value={it.durationMonths} onChange={(e) => handleInternshipChange(idx, 'durationMonths', e.target.value)} />
              </div>
              <div className="field" style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'center' }}>
                <button type="button" className="secondary" onClick={() => removeArrayItem('internships', idx)}>X</button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('internships', { company: '', role: '', durationMonths: '' })}>Add Internship</button>
        </div>

        <div className="field" style={{ gridColumn: 'span 12' }}>
          <label>Events</label>
          {form.events.map((ev, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input
                placeholder="e.g., ML Workshop, 2025"
                value={ev}
                onChange={(e) => handleArrayChange('events', idx, e.target.value)}
              />
              <button type="button" className="secondary" onClick={() => removeArrayItem('events', idx)}>Remove</button>
            </div>
          ))}
          <button type="button" onClick={() => addArrayItem('events', '')}>Add Event</button>
        </div>

        <div className="field" style={{ gridColumn: 'span 12' }}>
          <label>Certificates / Documents</label>
          <input type="file" multiple onChange={onCertificatesSelected} />
          {uploading && <span className="small">Uploading...</span>}
          {!!form.certificates.length && (
            <div className="file-list small">
              {form.certificates.map((url, i) => (
                <span key={i}>{url}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Profile'}</button>
        {message && <span className="small">{message}</span>}
      </div>
    </form>
  );
}
