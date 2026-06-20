const fs = require('fs');

function wireIntake() {
  let file = fs.readFileSync('src/app/complaints/new/page.tsx', 'utf8');

  // Add use client
  file = '"use client";\nimport { useState } from "react";\nimport { useRouter } from "next/navigation";\n' + file;

  // Add state
  const stateLogic = `export default function NewComplaint() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [district, setDistrict] = useState('Central');
  const [categorySource, setCategorySource] = useState('manual');
  const [submitting, setSubmitting] = useState(false);

  const handleClassify = async () => {
    if (!title && !description) return;
    try {
      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description })
      });
      const data = await res.json();
      if (data.category) {
        setCategory(data.category);
        setPriority(data.priority);
        setCategorySource('ai_suggested');
      }
    } catch(e) {}
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, category: category || 'other', priority: priority || 'low', district, categorySource, source: 'direct' })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/complaints/' + data.complaint.complaintId + '/track');
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };
`;
  file = file.replace(/export default function NewComplaint\(\) \{/, stateLogic);

  // Wire form
  file = file.replace(/<form className="space-y-xl">/, '<form className="space-y-xl" onSubmit={handleSubmit}>');

  // Title
  file = file.replace(/<input type="text" placeholder="Brief title.*? \/>/s, `<input type="text" placeholder="Brief title" className="w-full p-md bg-surface border border-outline rounded-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={title} onChange={e => setTitle(e.target.value)} required />`);

  // Description
  file = file.replace(/<textarea placeholder="Describe the issue in detail.*?>.*?<\/textarea>/s, `<textarea placeholder="Describe the issue in detail." className="w-full h-32 p-md bg-surface border border-outline rounded-lg text-body-lg text-on-surface resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" value={description} onChange={e => setDescription(e.target.value)} onBlur={handleClassify} required></textarea>`);

  // Category
  const newCat = `<select className="w-full p-md bg-surface border border-outline rounded-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none" value={category} onChange={e => {setCategory(e.target.value); setCategorySource('manual');}} required>
    <option value="">Select category</option>
    <option value="roads">Roads & Potholes</option>
    <option value="water">Water Supply</option>
    <option value="electricity">Electricity</option>
    <option value="sanitation">Sanitation</option>
    <option value="law_order">Law & Order</option>
    <option value="other">Other</option>
  </select>`;
  file = file.replace(/<select className="w-full p-md bg-surface border border-outline.*?<\/select>/s, newCat);

  // Priority
  const newPri = `<select className="w-full p-md bg-surface border border-outline rounded-lg text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none" value={priority} onChange={e => setPriority(e.target.value)} required>
    <option value="low">Low Priority</option>
    <option value="medium">Medium Priority</option>
    <option value="high">High Priority</option>
    <option value="critical">Critical</option>
  </select>`;
  file = file.replace(/<select className="w-full p-md bg-surface border border-outline.*?Low Priority.*?<\/select>/s, newPri);

  // Submit button
  file = file.replace(/<button type="submit" className="w-full.*?<\/button>/s, `<button type="submit" disabled={submitting} className="w-full bg-primary hover:bg-primary\/90 text-on-primary rounded-full py-md font-label-lg transition-colors active:scale-\[0.98\]">{submitting ? 'Submitting...' : 'Submit Grievance'}</button>`);

  // AI badge
  if (file.includes('id="ai-badge"')) {
     file = file.replace(/<span id="ai-badge".*?<\/span>/s, `{categorySource === 'ai_suggested' && <span id="ai-badge" className="inline-flex items-center gap-xs px-sm py-xs rounded-md bg-primary-container text-on-primary-container text-label-sm font-medium"><span className="material-symbols-outlined text-[14px]">auto_awesome</span>Auto-suggested</span>}`);
  }

  fs.writeFileSync('src/app/complaints/new/page.tsx', file);
}

wireIntake();
