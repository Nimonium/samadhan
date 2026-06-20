"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OfficerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/officer/dashboard');
        const d = await res.json();
        if (d.complaints) {
          setData(d);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-xl text-center">Loading...</div>;
  if (!data) return <div className="p-xl text-center text-error">Failed to load dashboard</div>;

  return (
    <>
    <nav className="bg-surface border-b border-outline-variant w-full sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-6 md:px-margin-desktop max-w-container-max mx-auto h-16">
            <div className="flex items-center gap-8">
                <span className="font-headline-md text-headline-md font-bold text-primary">Samadhan</span>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 ml-2 cursor-pointer hover:bg-surface-container-low p-1 rounded-lg" onClick={() => router.push('/login')}>
                    <span className="text-label-md font-label-md hidden md:block">Logout</span>
                </div>
            </div>
        </div>
    </nav>
    
    <main className="flex-grow w-full max-w-container-max mx-auto px-6 md:px-margin-desktop py-lg">
        <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
                <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">My Desk</h1>
                <p className="text-body-lg text-on-surface-variant flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${data.integrityScore < 50 ? 'bg-error' : data.integrityScore < 80 ? 'bg-orange-500' : 'bg-green-500'}`}></span>
                    Integrity Score: {data.integrityScore}/100
                </p>
            </div>
        </header>

        {data.complaints.some((c: any) => c.priority === 'critical' && c.status !== 'closed') && (
        <div className="bg-error text-white p-4 rounded-lg mb-xl shadow-sm flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            <span className="font-bold">You have active critical complaints that require immediate attention!</span>
        </div>
        )}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-md opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="material-symbols-outlined text-[64px]">inbox</span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Active Cases</h3>
                <p className="font-display-sm text-display-sm font-bold text-on-surface">{data.metrics.open}</p>
            </div>
            <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-2">Resolved</h3>
                <p className="font-display-sm text-display-sm font-bold text-primary">{data.metrics.resolved}</p>
            </div>
            <div className="bg-error-container p-lg rounded-xl border border-error shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                <h3 className="font-label-md text-label-md text-on-error-container uppercase tracking-wider mb-2">Reopened</h3>
                <p className="font-display-sm text-display-sm font-bold text-error">{data.metrics.reopened}</p>
            </div>
        </section>

        <section>
            <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container-lowest border-b border-outline-variant">
                            <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">ID &amp; Title</th>
                            <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant hidden md:table-cell">Priority</th>
                            <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">Status</th>
                            <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant hidden lg:table-cell">Age</th>
                            <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.complaints.map((c: any) => (
                        <tr key={c._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors cursor-pointer group" onClick={() => router.push(`/officer/complaints/${c._id}`)}>
                            <td className="p-4">
                                <p className="font-label-md text-label-md font-bold text-on-surface group-hover:text-primary transition-colors">{c.complaintId}</p>
                                <p className="text-body-sm text-on-surface-variant truncate max-w-[200px] md:max-w-xs">{c.title}</p>
                            </td>
                            <td className="p-4 hidden md:table-cell">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded font-label-sm text-xs ${c.priority === 'critical' ? 'bg-error-container text-on-error-container' : 'bg-surface-container text-on-surface-variant'}`}>
                                    {c.priority.toUpperCase()}
                                </span>
                            </td>
                            <td className="p-4">
                                <span className="inline-flex items-center px-2 py-1 rounded-full border border-outline-variant bg-surface-container-low text-on-surface-variant text-xs font-label-sm">
                                    {c.status}
                                </span>
                            </td>
                            <td className="p-4 hidden lg:table-cell">
                                <p className="text-body-sm text-on-surface-variant">{Math.round((new Date().getTime() - new Date(c.createdAt).getTime())/(1000*60*60*24))} days</p>
                            </td>
                            <td className="p-4 text-right">
                                <button className="p-2 text-primary hover:bg-primary-container rounded-full transition-colors" aria-label="Open Complaint">
                                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                </button>
                            </td>
                        </tr>
                        ))}
                        {data.complaints.length === 0 && (
                        <tr>
                            <td colSpan={5} className="p-xl text-center text-on-surface-variant">No assigned complaints</td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    </main>
    </>
  );
}
