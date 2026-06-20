"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function OfficerDetail() {
  const { id } = useParams();
  const router = useRouter();
  
  const [complaint, setComplaint] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchComplaint() {
      try {
        const res = await fetch(`/api/complaints/${id}`);
        const data = await res.json();
        if (data.complaint) {
          setComplaint(data.complaint);
          setAuditLogs(data.auditLogs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaint();
  }, [id]);

  const submitResolution = async () => {
    if (resolutionNote.length < 10) {
      alert("Resolution note must be at least 10 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/officer/complaints/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNote })
      });
      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        // Refresh
        const resLogs = await fetch(`/api/complaints/${id}`);
        const dataLogs = await resLogs.json();
        setComplaint(dataLogs.complaint);
        setAuditLogs(dataLogs.auditLogs);
      } else {
        alert(data.error || "Failed to resolve");
      }
    } catch(err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;
  if (!complaint) return <div className="p-xl text-center">Complaint not found or access denied.</div>;

  return (
    <>
    <nav className="bg-surface border-b border-outline-variant w-full sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-6 md:px-margin-desktop max-w-container-max mx-auto h-16">
            <div className="flex items-center gap-8">
                <span className="font-headline-md text-headline-md font-bold text-primary">Samadhan</span>
                <div className="hidden md:flex gap-6 items-center">
                    <a className="text-primary border-b-2 border-primary pb-1 font-body-md" href="#">My Complaints</a>
                    <a className="text-on-surface-variant hover:bg-surface-container-low transition-colors px-3 py-1 rounded font-body-md" href="#">Statistics</a>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-surface-container-low p-1 rounded-lg" onClick={() => router.push('/login')}>
                    <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-xs overflow-hidden">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <span className="text-label-md font-label-md hidden md:block">Officer Profile</span>
                </div>
            </div>
        </div>
    </nav>
    
    <main className="flex-grow w-full max-w-container-max mx-auto px-6 md:px-margin-desktop py-lg">
        <header className="mb-lg">
            <nav className="flex items-center text-on-surface-variant gap-2 text-label-md mb-2">
                <a className="hover:text-primary" onClick={() => router.push('/officer/dashboard')}>My Complaints</a>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                <span className="text-on-surface font-medium">#{complaint.complaintId}</span>
            </nav>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3">{complaint.title}</h1>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-surface-container-high text-primary font-label-md rounded-full border border-outline-variant flex items-center gap-1 uppercase">
                            {complaint.category}
                        </span>
                        <span className="px-3 py-1 bg-error-container text-on-error-container font-label-md rounded-full border border-error flex items-center gap-1 uppercase">
                            {complaint.priority}
                        </span>
                        <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-label-md rounded-full border border-outline-variant flex items-center gap-1 uppercase">
                            Status: {complaint.status}
                        </span>
                        {complaint.source === 'mcd311' && (
                        <span className="px-3 py-1 bg-surface-container text-on-surface-variant font-label-md rounded-full border border-outline-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[18px]">sync</span> Synced from MCD311
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        </span>
                        )}
                    </div>
                </div>
            </div>
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <div className="lg:col-span-7 space-y-lg">
                <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">description</span> Issue Description
                    </h2>
                    <p className="text-body-md text-on-surface leading-relaxed">
                        {complaint.description}
                    </p>
                </section>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm">
                        <h2 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-4">Location</h2>
                        <div className="aspect-video rounded-lg overflow-hidden border border-outline-variant">
                            <Map lat={complaint.geo?.lat} lng={complaint.geo?.lng} />
                        </div>
                        <p className="mt-2 text-body-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">location_on</span> {complaint.district} District
                        </p>
                    </section>
                </div>
                
                <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-sm flex items-center justify-between">
                    <div>
                        <h2 className="font-label-md text-label-md font-bold text-on-surface-variant uppercase tracking-wider mb-1">Citizen Contact</h2>
                        <p className="text-body-lg font-medium text-on-surface">{complaint.citizen?.name} <span className="text-on-surface-variant ml-2">({complaint.citizen?.phone})</span></p>
                    </div>
                </section>
            </div>
            
            <div className="lg:col-span-5">
                <div className="sticky top-24 space-y-lg">
                    {['submitted', 'routed', 'in_progress'].includes(complaint.status) && (
                    <section className="bg-white border border-outline-variant rounded-xl p-lg shadow-lg">
                        <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface mb-6">Update Resolution Status</h2>
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(true); }}>
                            <div>
                                <label className="block font-label-md text-label-md text-on-surface-variant mb-2">Resolution Notes <span className="text-error">*</span></label>
                                <textarea
                                    className="w-full px-4 py-3 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-all text-body-md placeholder:text-surface-dim resize-none"
                                    placeholder="Provide detailed steps taken for resolution, personnel involved, and final outcome..."
                                    required rows={6}
                                    value={resolutionNote}
                                    onChange={e => setResolutionNote(e.target.value)}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-container hover:shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">check_circle</span> Mark as Resolved
                            </button>
                        </form>
                    </section>
                    )}
                </div>
            </div>
        </div>
        
        <section className="mt-xl bg-white border border-outline-variant rounded-xl p-lg shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 mb-8">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">System Audit Log</h2>
            </div>
            <div className="space-y-8 relative pl-4">
                {auditLogs.map(log => (
                <div key={log._id} className="audit-line relative flex gap-4 items-start">
                    <div className="w-4 h-4 rounded-full bg-secondary ring-4 ring-secondary-fixed z-10 mt-1"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-2">
                        <p className="text-body-md text-on-surface">
                            <span className="font-medium">{log.performedBy?.name || 'System'}</span> action: <span className="font-bold text-secondary uppercase">{log.action}</span>
                            {log.note && <span className="italic block mt-1 text-on-surface-variant">&quot;{log.note}&quot;</span>}
                        </p>
                        <span className="font-mono text-body-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                </div>
                ))}
            </div>
        </section>
    </main>
    
    {isModalOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="resolutionModal">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full relative z-10 overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-lg">
                <div className="w-16 h-16 bg-error-container text-error rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="material-symbols-outlined text-[40px]">warning</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface text-center mb-4">Confirm Resolution?</h3>
                <p className="text-body-md text-on-surface-variant text-center mb-8">
                    Citizen will be notified to confirm this resolution. False or premature closures affect your <span className="font-bold text-on-surface">integrity score</span> and may lead to disciplinary action.
                </p>
                <div className="flex gap-3">
                    <button disabled={submitting} className="flex-1 h-12 border border-outline text-on-surface font-bold rounded-lg hover:bg-surface-container transition-colors" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button disabled={submitting} className="flex-1 h-12 bg-primary text-white font-bold rounded-lg hover:bg-primary-container shadow-lg shadow-primary/20 transition-all" onClick={submitResolution}>{submitting ? 'Submitting...' : 'Confirm'}</button>
                </div>
            </div>
        </div>
    </div>
    )}
    </>
  );
}
