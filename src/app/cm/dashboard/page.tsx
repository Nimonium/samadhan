"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CMDashboard() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/cm/dashboard');
        const d = await res.json();
        if (d.kpis) {
          setData(d);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();

    const { io } = require('socket.io-client');
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const socket = io(socketUrl);
    socket.emit('join_cm_room');
    socket.on('critical_alert', (payload: any) => {
      setAlerts(prev => [payload, ...prev]);
      setNewCount(c => c + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) return <div className="p-xl text-center">Loading...</div>;
  if (!data) return <div className="p-xl text-center text-error">Failed to load dashboard</div>;

  return (
    <div className="flex h-screen bg-surface-container-lowest overflow-hidden">
        <aside className="w-64 bg-surface border-r border-outline-variant flex flex-col justify-between hidden md:flex shrink-0">
            <div>
                <div className="h-16 flex items-center px-lg border-b border-outline-variant">
                    <span className="material-symbols-outlined text-primary mr-3" style={{fontVariationSettings:"'FILL' 1"}}>account_balance</span>
                    <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Samadhan</h1>
                </div>
                <div className="p-4">
                    <p className="text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider mb-2 px-3">CM Office</p>
                    <nav className="space-y-1">
                        <a href="#" className="flex items-center gap-3 px-3 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-label-md">
                            <span className="material-symbols-outlined text-[20px]" style={{fontVariationSettings:"'FILL' 1"}}>dashboard</span> Dashboard
                        </a>
                        <a href="#" className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg font-label-md transition-colors">
                            <span className="material-symbols-outlined text-[20px]">group</span> Officers
                        </a>
                        <a href="#" onClick={() => router.push('/cm/field')} className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg font-label-md transition-colors">
                            <span className="material-symbols-outlined text-[20px]">map</span> Field View
                        </a>
                    </nav>
                </div>
            </div>
            <div className="p-4 border-t border-outline-variant">
                <div className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container hover:text-on-surface rounded-lg font-label-md transition-colors cursor-pointer" onClick={() => router.push('/login')}>
                    <span className="material-symbols-outlined text-[20px]">logout</span> Logout
                </div>
            </div>
        </aside>
        
        <main className="flex-1 overflow-y-auto">
            <header className="h-16 bg-surface border-b border-outline-variant flex justify-between items-center px-lg sticky top-0 z-10">
                <div className="flex items-center gap-2 md:hidden">
                    <button className="material-symbols-outlined p-2 text-on-surface">menu</button>
                    <span className="font-headline-sm text-headline-sm font-bold text-primary">Samadhan</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm hidden md:block text-on-surface font-medium">Command Center Overview</h2>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 bg-surface-container border border-outline-variant px-3 py-1.5 rounded-lg text-label-md hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span> Last 30 Days
                    </button>
                    <button className="material-symbols-outlined p-2 bg-surface-container rounded-full text-on-surface hover:bg-surface-container-high transition-colors relative">
                        notifications
                        <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
                    </button>
                </div>
            </header>

            <div className="p-lg max-w-[1400px] mx-auto space-y-xl">
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-md">
                    <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Open</h3>
                            <span className="material-symbols-outlined text-on-surface-variant opacity-50">inbox</span>
                        </div>
                        <p className="font-display-md text-display-md font-bold text-on-surface">{data.kpis.totalOpen}</p>
                    </div>
                    <div className="bg-error-container p-lg rounded-xl border border-error/30 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <h3 className="font-label-md text-label-md text-on-error-container uppercase tracking-wider">SLA Breaches</h3>
                            <span className="material-symbols-outlined text-error" style={{fontVariationSettings:"'FILL' 1"}}>warning</span>
                        </div>
                        <p className="font-display-md text-display-md font-bold text-error relative z-10">{data.kpis.slaBreaches}</p>
                        <div className="absolute -bottom-4 -right-4 material-symbols-outlined text-[100px] text-error opacity-10">warning</div>
                    </div>
                    <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Avg Resolution</h3>
                            <span className="material-symbols-outlined text-on-surface-variant opacity-50">timer</span>
                        </div>
                        <p className="font-display-md text-display-md font-bold text-on-surface">{data.kpis.avgResolutionTime} <span className="text-headline-sm text-on-surface-variant font-normal">hrs</span></p>
                    </div>
                </section>
                
                {alerts.length > 0 && (
                <section className="bg-error-container border border-error/50 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-error/20 flex justify-between items-center bg-error/10">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-error">campaign</span>
                            <h3 className="font-headline-sm text-headline-sm font-bold text-error">Critical Live Alerts</h3>
                        </div>
                        {newCount > 0 && (
                            <span className="px-3 py-1 bg-error text-white font-label-md rounded-full pulsing-dot flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                                {newCount} NEW
                            </span>
                        )}
                    </div>
                    <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                        {alerts.map((a, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-error/20 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-on-surface">#{a.complaintId} - {a.district} District</p>
                                    <p className="text-body-sm text-on-surface-variant">{a.title}</p>
                                </div>
                                <button className="bg-error/10 text-error px-3 py-1 rounded text-sm font-bold hover:bg-error hover:text-white transition-colors" onClick={() => setNewCount(0)}>Review</button>
                            </div>
                        ))}
                    </div>
                </section>
                )}

                <section className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
                    <div className="p-lg border-b border-outline-variant flex justify-between items-center bg-surface-bright">
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Officer Bandwidth &amp; Integrity Tracker</h3>
                        <button onClick={async () => {
                            const res = await fetch('/api/cm/review-random');
                            const data = await res.json();
                            if (data.complaints) {
                                alert('Randomly Sampled Closed Complaints for Review:\n' + data.complaints.map((c: any) => `- #${c.complaintId}: ${c.title} (Resolved by: ${c.officer?.name})`).join('\n'));
                            }
                        }} className="bg-primary text-white px-4 py-2 rounded-lg font-label-sm font-bold shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">shuffle</span>
                            Randomly Review Closed Complaints
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-surface-container-lowest border-b border-outline-variant">
                                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">Officer Name</th>
                                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">Department</th>
                                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">Active Cases</th>
                                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant">Integrity Score</th>
                                    <th className="p-4 font-label-md text-label-md font-bold text-on-surface-variant text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.officerStats.map((officer: any) => (
                                <tr key={officer._id} className="border-b border-outline-variant hover:bg-surface-container-lowest transition-colors">
                                    <td className="p-4 font-body-md text-on-surface font-medium">{officer.name}</td>
                                    <td className="p-4 font-body-md text-on-surface-variant">{officer.department}</td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-body-md font-bold">{officer.activeCases}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`font-bold ${officer.integrityScore < 90 ? 'text-error' : 'text-green-600'}`}>{officer.integrityScore}/100</span>
                                            <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                                                <div className={`h-full ${officer.integrityScore < 90 ? 'bg-error' : 'bg-green-500'}`} style={{width: `${Math.max(officer.integrityScore, 0)}%`}}></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="text-primary font-label-md hover:underline px-2 py-1 rounded hover:bg-primary-container/30 transition-colors">Audit Logs</button>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    </div>
  );
}
