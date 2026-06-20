"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function CMField() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('nearby');

  return (
    <div className="bg-surface min-h-screen pb-20">
    <header className="bg-primary text-on-primary sticky top-0 z-50 shadow-md">
        <div className="flex justify-between items-center px-4 h-16">
            <div className="flex items-center gap-3">
                <span className="material-symbols-outlined" style={{fontVariationSettings:"'FILL' 1"}}>account_balance</span>
                <h1 className="font-headline-sm font-bold">Field View</h1>
            </div>
            <div className="flex items-center gap-3">
                <button className="material-symbols-outlined p-2 rounded-full hover:bg-white/10 transition-colors" onClick={() => router.push('/cm/dashboard')}>dashboard</button>
            </div>
        </div>
        
        <div className="flex px-2 pb-2 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab('nearby')} className={`px-4 py-2 whitespace-nowrap font-label-md transition-colors border-b-2 ${activeTab === 'nearby' ? 'border-white text-white font-bold' : 'border-transparent text-white/70 hover:text-white'}`}>
                Nearby Issues
            </button>
            <button onClick={() => setActiveTab('critical')} className={`px-4 py-2 whitespace-nowrap font-label-md transition-colors border-b-2 ${activeTab === 'critical' ? 'border-white text-white font-bold' : 'border-transparent text-white/70 hover:text-white'}`}>
                Critical SLA
            </button>
            <button onClick={() => setActiveTab('log')} className={`px-4 py-2 whitespace-nowrap font-label-md transition-colors border-b-2 ${activeTab === 'log' ? 'border-white text-white font-bold' : 'border-transparent text-white/70 hover:text-white'}`}>
                Visit Log
            </button>
        </div>
    </header>

    <main>
        {activeTab === 'nearby' && (
        <div id="view-nearby" className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative w-full h-64 bg-surface-container border-b border-outline-variant overflow-hidden">
                <Map />
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                    <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-primary hover:bg-surface-container-lowest transition-colors">
                        <span className="material-symbols-outlined">my_location</span>
                    </button>
                    <button className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-on-surface-variant hover:bg-surface-container-lowest transition-colors">
                        <span className="material-symbols-outlined">filter_list</span>
                    </button>
                </div>
            </div>

            <div className="p-4 bg-surface-container-lowest border-b border-outline-variant flex justify-between items-center sticky top-[104px] z-40 shadow-sm">
                <p className="font-label-md text-on-surface-variant"><span className="font-bold text-on-surface">3</span> issues within 2km</p>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase tracking-wider">1 Critical</span>
                </div>
            </div>

            <div className="p-4 space-y-4">
                <div className="bg-white border border-outline-variant rounded-xl p-4 shadow-sm active:scale-[0.98] transition-transform">
                    <div className="flex justify-between items-start mb-2">
                        <span className="px-2 py-1 bg-surface-container-high text-primary text-[10px] font-bold rounded uppercase tracking-wider">Roads</span>
                        <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">distance</span> 0.4 km
                        </span>
                    </div>
                    <h3 className="font-headline-sm font-bold text-on-surface mb-1">Deep Pothole on Main Arterial</h3>
                    <p className="text-body-sm text-on-surface-variant mb-3 line-clamp-2">Multiple complaints received regarding a severe pothole causing traffic slowdowns and potential accidents.</p>
                    <div className="flex justify-between items-center border-t border-outline-variant pt-3">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary-container text-primary flex items-center justify-center text-xs font-bold">P</div>
                            <span className="text-label-sm text-on-surface-variant">PWD Dept</span>
                        </div>
                        <span className="text-error font-label-sm font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">warning</span> SLA Breach
                        </span>
                    </div>
                </div>
            </div>
        </div>
        )}

        {activeTab === 'critical' && (
        <div id="view-critical" className="p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-headline-sm font-bold text-error mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">warning</span> Critical SLA Breaches
            </h2>
            <div className="bg-white border-2 border-error/50 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-error/10 rounded-bl-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-error mt-[-10px] ml-[10px]">timer_off</span>
                </div>
                <div className="flex justify-between items-start mb-2">
                    <span className="px-2 py-1 bg-error-container text-on-error-container text-[10px] font-bold rounded uppercase tracking-wider">Water Supply</span>
                </div>
                <h3 className="font-headline-sm font-bold text-on-surface mb-1 w-[80%]">Contaminated Water Supply</h3>
                <p className="text-body-sm text-on-surface-variant mb-3">SLA breached by 48 hours. Officer marked resolved but citizen rejected.</p>
                <div className="flex justify-between items-center border-t border-outline-variant pt-3">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-on-surface-variant uppercase">Assigned to</span>
                        <span className="text-label-sm font-bold">Rajesh K. (DJB)</span>
                    </div>
                    <button className="bg-primary text-white px-4 py-2 rounded-lg font-label-sm font-bold shadow-md active:scale-95 transition-transform">
                        Summon
                    </button>
                </div>
            </div>
        </div>
        )}

        {activeTab === 'log' && (
        <div id="view-log" className="p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="font-headline-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined">history</span> Visit Log
            </h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline before:to-transparent">
                
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-primary text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                        <span className="material-symbols-outlined text-[20px]">location_on</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-outline-variant shadow-sm">
                        <div className="flex justify-between items-start mb-1">
                            <h3 className="font-bold text-on-surface text-label-md">Site Inspection: Block C</h3>
                            <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-1 rounded">Today, 10:30 AM</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant">Verified DJB pipeline repair. Work satisfactory.</p>
                    </div>
                </div>
            </div>
        </div>
        )}
    </main>

    <div className="fixed bottom-6 right-4 z-50">
        <button className="w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/40 flex items-center justify-center hover:bg-primary/90 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[28px]">add_a_photo</span>
        </button>
    </div>
</div>
  );
}
