"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function CitizenTracking() {
  const { id } = useParams();
  const router = useRouter();
  const [complaint, setComplaint] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchComplaint();
  }, [id]);

  const handleConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/citizen/complaints/${id}/confirm`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.complaint);
        // Refresh logs
        const resLogs = await fetch(`/api/complaints/${id}`);
        const dataLogs = await resLogs.json();
        setAuditLogs(dataLogs.auditLogs);
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(false);
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/citizen/complaints/${id}/reject`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setComplaint(data.complaint);
        // Refresh logs
        const resLogs = await fetch(`/api/complaints/${id}`);
        const dataLogs = await resLogs.json();
        setAuditLogs(dataLogs.auditLogs);
      }
    } catch (err) {
      console.error(err);
    }
    setActionLoading(false);
  };

  if (loading) return <div className="p-xl text-center">Loading...</div>;
  if (!complaint) return <div className="p-xl text-center">Complaint not found or forbidden.</div>;

  return (
    <>
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-md md:px-margin-desktop h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary" style={{fontVariationSettings:"'FILL' 1"}}>account_balance</span>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">Samadhan</h1>
        </div>
        <div className="flex items-center gap-md">
            <button className="material-symbols-outlined p-sm rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">search</button>
            <button className="material-symbols-outlined p-sm rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant" onClick={() => router.push('/login')}>account_circle</button>
        </div>
    </header>
    
    <main className="pt-16 pb-xl">
        <section className="bg-surface-container-lowest border-b border-outline-variant">
            <div className="max-w-[1200px] mx-auto px-md md:px-margin-desktop py-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-md">
                    <div>
                        <div className="flex items-center gap-sm mb-xs">
                            <span className="bg-secondary-fixed text-on-secondary-fixed text-label-md font-label-md px-sm py-1 rounded-full uppercase">
                                {complaint.category}
                            </span>
                            <span className="text-on-surface-variant text-body-sm font-body-sm">
                                Submitted on {new Date(complaint.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">#{complaint.complaintId}</h2>
                    </div>
                    <button className="flex items-center gap-sm text-primary font-label-md px-md py-sm border border-outline rounded-lg hover:bg-surface-container-low transition-all">
                        <span className="material-symbols-outlined text-[20px]">download</span>
                        Get PDF Receipt
                    </button>
                </div>
            </div>
        </section>
        
        <div className="max-w-[1200px] mx-auto px-md md:px-margin-desktop mt-xl grid grid-cols-1 lg:grid-cols-12 gap-xl">
            <div className="lg:col-span-4 space-y-xl">
                <div className="p-lg bg-surface-container-lowest rounded-xl border border-outline-variant">
                    <h3 className="font-headline-sm text-headline-sm mb-xl">Tracking Status</h3>
                    <div className="space-y-0 relative">
                        <div className="flex gap-lg pb-xl border-l-2 border-primary ml-[11px] pl-[21px] relative">
                            <div className="absolute -left-[12px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'wght' 700"}}>check</span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-primary">Submitted</p>
                                <p className="text-body-sm text-on-surface-variant">{new Date(complaint.createdAt).toLocaleString()}</p>
                            </div>
                        </div>
                        
                        {['in_progress', 'resolved_pending_confirmation', 'closed'].includes(complaint.status) && (
                        <div className="flex gap-lg pb-xl border-l-2 border-primary ml-[11px] pl-[21px] relative">
                            <div className="absolute -left-[12px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'wght' 700"}}>check</span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-primary">In Progress</p>
                            </div>
                        </div>
                        )}
                        
                        {['resolved_pending_confirmation'].includes(complaint.status) && (
                        <div className="flex gap-lg pb-xl border-l-2 border-outline-variant ml-[11px] pl-[21px] relative">
                            <div className="absolute -left-[12px] top-0 w-6 h-6 rounded-full bg-primary pulsing-dot flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                            </div>
                            <div className="bg-primary-container/10 p-md rounded-lg border border-primary/20 -mt-2">
                                <p className="font-label-md text-label-md text-primary font-bold">Resolved (Pending Your Confirmation)</p>
                            </div>
                        </div>
                        )}

                        {['closed'].includes(complaint.status) && (
                        <div className="flex gap-lg ml-[11px] pl-[21px] relative">
                            <div className="absolute -left-[12px] top-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
                                <span className="material-symbols-outlined text-[16px]" style={{fontVariationSettings:"'wght' 700"}}>check</span>
                            </div>
                            <div>
                                <p className="font-label-md text-label-md text-primary">Closed</p>
                                <p className="text-body-sm text-on-surface-variant">{complaint.citizenConfirmedAt ? new Date(complaint.citizenConfirmedAt).toLocaleString() : ''}</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>
                
                <div className="p-lg bg-surface-container-low rounded-xl border border-outline-variant space-y-md">
                    <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Administrative Details</h4>
                    <div className="flex items-start gap-md">
                        <span className="material-symbols-outlined text-on-surface-variant">account_balance</span>
                        <div>
                            <p className="text-body-sm text-on-surface-variant">Department</p>
                            <p className="font-label-md text-label-md">{complaint.department?.name || 'Assigned'}</p>
                        </div>
                    </div>
                    {complaint.officer && (
                    <div className="flex items-start gap-md border-t border-outline-variant pt-md">
                        <span className="material-symbols-outlined text-on-surface-variant">person</span>
                        <div>
                            <p className="text-body-sm text-on-surface-variant">Assigned Officer</p>
                            <p className="font-label-md text-label-md">{complaint.officer.name}</p>
                        </div>
                    </div>
                    )}
                </div>
            </div>
            
            <div className="lg:col-span-8 space-y-xl">
                {complaint.status === 'resolved_pending_confirmation' && (
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="p-xl bg-surface-bright border-b border-outline-variant flex items-center gap-md">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700">
                            <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>verified</span>
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">Officer marked this as Resolved</h3>
                    </div>
                    <div className="p-xl space-y-xl">
                        <div className="p-lg bg-surface-container-low rounded-lg border border-outline-variant italic text-on-surface-variant">
                            &quot;{complaint.resolutionNote}&quot;
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                            <button disabled={actionLoading} onClick={handleConfirm} className="flex flex-col items-center justify-center gap-xs h-32 rounded-xl bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all shadow-md group">
                                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">task_alt</span>
                                <span className="font-label-md text-headline-sm">Yes, it&apos;s fixed</span>
                            </button>
                            <button disabled={actionLoading} onClick={handleReject} className="flex flex-col items-center justify-center gap-xs h-32 rounded-xl border-2 border-error text-error hover:bg-error-container/20 active:scale-95 transition-all group">
                                <span className="material-symbols-outlined text-3xl group-hover:scale-110 transition-transform">report_problem</span>
                                <span className="font-label-md text-headline-sm">No, reopen this</span>
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-sm text-on-surface-variant">
                            <span className="material-symbols-outlined text-[18px]">info</span>
                            <p className="text-body-sm">If you don&apos;t respond in 72 hours, we&apos;ll review this automatically</p>
                        </div>
                    </div>
                </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <div className="relative group h-64 rounded-xl overflow-hidden border border-outline-variant bg-surface-container-highest">
                        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://placehold.co/400x300/E2E8F0/1E293B?text=Placeholder" alt="Location Map" />
                        <div className="absolute bottom-0 left-0 right-0 p-md bg-gradient-to-t from-black/60 to-transparent text-white">
                            <p className="text-label-md">Complaint Location</p>
                        </div>
                    </div>
                    <div className="p-lg bg-primary-container text-on-primary-container rounded-xl flex flex-col justify-between overflow-y-auto max-h-64">
                        <div>
                            <h4 className="font-headline-sm text-headline-sm mb-sm flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">lock</span>
                                System Audit Log
                            </h4>
                            <p className="text-body-sm opacity-90 mb-4">Every action is cryptographically timestamped.</p>
                            <div className="space-y-sm text-sm">
                                {auditLogs.map(log => (
                                    <div key={log._id} className="border-b border-primary/20 pb-2">
                                        <div className="font-bold">{log.action}</div>
                                        <div className="text-xs opacity-80 font-mono tracking-tighter">{new Date(log.timestamp).toLocaleString()}</div>
                                        {log.note && <div className="italic text-xs mt-1">&quot;{log.note}&quot;</div>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
    </>
  );
}
