import React, { useState } from 'react';
import { saveProfile, uploadFiles } from '../../services/api';

export default function AlumniProfileForm() {
  const [form, setForm] = useState({
    careerProgress: '',
    skills: [''],
    projects: [{ name: '', description: '', link: '' }],
    companyDetails: { company: '', position: '', domain: '', yearsOfExperience: '' },
    documents: []
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

  const handleProjectChange = (index, key, value) => {
    const arr = [...form.projects];
    arr[index] = { ...arr[index], [key]: value };
    updateField('projects', arr);
  };

  const handleCompanyDetailsChange = (key, value) => {
    updateField('companyDetails', { ...form.companyDetails, [key]: value });
  };

  const onDocumentsSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    try {
      const resp = await uploadFiles('/users/upload-documents', files);
      const urls = resp?.data?.files || [];
      updateField('documents', [...form.documents, ...urls]);
      setMessage('Documents uploaded');
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
        careerProgress: form.careerProgress,
        skills: form.skills.filter(Boolean),
        projects: form.projects.filter((p) => p.name || p.description || p.link),
        companyDetails: form.companyDetails,
        documents: form.documents
      };
      await saveProfile('alumni', payload);
      setMessage('Profile saved');
    } catch (err) {
      setMessage('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <h2>Alumni Profile</h2>

      <div className="field" style={{ marginBottom: 12 }}>
        <label>Career Progress</label>
        <textarea placeholder="Share your journey, milestones, and growth..." value={form.careerProgress} onChange={(e) => updateField('careerProgress', e.target.value)} />
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label>Skills</label>
        {form.skills.map((sk, idx) => (
          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input placeholder="e.g., React, Data Science" value={sk} onChange={(e) => handleArrayChange('skills', idx, e.target.value)} />
            <button type="button" className="secondary" onClick={() => removeArrayItem('skills', idx)}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('skills', '')}>Add Skill</button>
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label>Projects</label>
        {form.projects.map((pr, idx) => (
          <div key={idx} className="row" style={{ gridTemplateColumns: 'repeat(12, 1fr)', marginBottom: 8 }}>
            <div className="field" style={{ gridColumn: 'span 4' }}>
              <input placeholder="Name" value={pr.name} onChange={(e) => handleProjectChange(idx, 'name', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: 'span 5' }}>
              <input placeholder="Description" value={pr.description} onChange={(e) => handleProjectChange(idx, 'description', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: 'span 2' }}>
              <input placeholder="Link" value={pr.link} onChange={(e) => handleProjectChange(idx, 'link', e.target.value)} />
            </div>
            <div className="field" style={{ gridColumn: 'span 1', display: 'flex', alignItems: 'center' }}>
              <button type="button" className="secondary" onClick={() => removeArrayItem('projects', idx)}>X</button>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addArrayItem('projects', { name: '', description: '', link: '' })}>Add Project</button>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 12 }}>
        <h3 style={{ marginTop: 0 }}>Company Details</h3>
        <div className="row" style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}>
          <div className="field" style={{ gridColumn: 'span 4' }}>
            <input placeholder="Company" value={form.companyDetails.company} onChange={(e) => handleCompanyDetailsChange('company', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: 'span 4' }}>
            <input placeholder="Position" value={form.companyDetails.position} onChange={(e) => handleCompanyDetailsChange('position', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <input placeholder="Domain" value={form.companyDetails.domain} onChange={(e) => handleCompanyDetailsChange('domain', e.target.value)} />
          </div>
          <div className="field" style={{ gridColumn: 'span 2' }}>
            <input type="number" placeholder="Years of Experience" value={form.companyDetails.yearsOfExperience} onChange={(e) => handleCompanyDetailsChange('yearsOfExperience', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 12 }}>
        <label>Documents</label>
        <input type="file" multiple onChange={onDocumentsSelected} />
        {uploading && <span className="small">Uploading...</span>}
        {!!form.documents.length && (
          <div className="file-list small">
            {form.documents.map((url, i) => (
              <span key={i}>{url}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button type="submit" disabled={saving || uploading}>{saving ? 'Saving...' : 'Save Profile'}</button>
        {message && <span className="small">{message}</span>}
      </div>
    </form>
  );
}
