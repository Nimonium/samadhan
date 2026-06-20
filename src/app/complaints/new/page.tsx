"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import React from 'react';

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function CitizenIntake() {
  const [priority, setPriority] = useState('medium');
  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface border-b border-outline-variant h-16 flex items-center justify-between px-margin-mobile">
        <div className="flex items-center gap-4">
          <button aria-label="Go back" className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors duration-200">
            <span className="material-symbols-outlined text-primary" data-icon="arrow_back">arrow_back</span>
          </button>
          <h1 className="font-headline-sm text-headline-sm text-primary">File a Complaint</h1>
        </div>
        <div className="w-10"></div> 
      </header>
      <main className="mt-20 px-margin-mobile max-w-container-max mx-auto space-y-6 pb-28">
        
        <section className="bg-surface-container-low rounded-xl p-lg border border-outline-variant shadow-sm">
            <div className="flex justify-between items-center mb-sm">
                <span className="font-label-md text-label-md text-primary font-bold">Step 1 of 3</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Complaint Details</span>
            </div>
            <div className="w-full bg-surface-variant h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full step-transition" id="progress-bar" style={{"width":"33.33%"}}></div>
            </div>
        </section>
        
        <div className="space-y-gutter">
            <section className="bg-white rounded-xl border border-outline-variant p-lg shadow-sm">
                <div className="flex items-center gap-2 mb-md">
                    <span className="material-symbols-outlined text-primary" data-icon="description">description</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Complaint Details</h2>
                </div>
                <div className="space-y-md">
                    
                    <div>
                        <div className="flex justify-between items-center mb-xs">
                            <label className="font-label-md text-label-md text-on-surface-variant">Complaint Category</label>
                            <span className="bg-secondary-fixed text-on-secondary-fixed-variant px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]" data-icon="auto_awesome">auto_awesome</span>
                                ✨ Auto-suggested
                            </span>
                        </div>
                        <div className="relative">
                            <select className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none appearance-none">
                                <option disabled defaultValue="" value="">Select a category</option>
                                <option value="roads">🛣️ Roads</option>
                                <option value="water">💧 Water Supply</option>
                                <option value="electricity">⚡ Electricity</option>
                                <option value="sanitation">🧹 Sanitation</option>
                                <option value="law_order">👮 Law &amp; Order</option>
                                <option value="other">📋 Other</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" data-icon="expand_more">expand_more</span>
                        </div>
                    </div>
                    
                    <div>
                        <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Short Title</label>
                        <input className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none" placeholder="e.g. Pothole on MG Road" type="text" />
                    </div>
                    
                    <div>
                        <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Description</label>
                        <textarea className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none resize-none" placeholder="Describe the issue in detail" rows={4}></textarea>
                    </div>
                </div>
            </section>
            
            <section className="bg-white rounded-xl border border-outline-variant p-lg shadow-sm">
                <div className="flex items-center gap-2 mb-md">
                    <span className="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Location</h2>
                </div>
                <div className="space-y-md">
                    
                    <div className="relative w-full h-48 rounded-xl overflow-hidden border border-outline-variant bg-surface-variant">
                        <Map />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-4xl" data-icon="location_on" style={{"fontVariationSettings":"'FILL' 1"}}>location_on</span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                            <button className="bg-primary text-on-primary px-4 py-2 rounded-full font-label-md text-label-md flex items-center gap-2 shadow-lg active:scale-95 transition-transform">
                                <span className="material-symbols-outlined text-sm" data-icon="my_location">my_location</span>
                                Use my current location
                            </button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="font-label-md text-label-md text-on-surface-variant mb-xs block">Manual Address Fallback</label>
                        <input className="w-full h-12 bg-white border border-outline-variant rounded-lg px-4 font-body-md text-body-md focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none" placeholder="House no, Street, Area name" type="text" />
                    </div>
                </div>
            </section>
            
            <section className="bg-white rounded-xl border border-outline-variant p-lg shadow-sm">
                <div className="flex items-center gap-2 mb-md">
                    <span className="material-symbols-outlined text-primary" data-icon="attachment">attachment</span>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Supporting Evidence &amp; Priority</h2>
                </div>
                <div className="space-y-lg">
                    
                    <div className="border-2 border-dashed border-outline-variant rounded-xl p-xl flex flex-col items-center justify-center bg-surface-container-low hover:bg-surface-variant transition-colors cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center mb-md group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-primary text-3xl" data-icon="photo_camera">photo_camera</span>
                        </div>
                        <p className="font-headline-sm text-headline-sm text-primary mb-1">Attach Photo/Video</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Maximum file size: 10MB</p>
                    </div>
                    
                    <div>
                        <label className="font-label-md text-label-md text-on-surface-variant mb-md block">Issue Severity</label>
                        <div className="grid grid-cols-3 gap-sm">
                            <button
                                type="button"
                                className={`severity-pill h-12 rounded-full border border-outline-variant font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${priority === 'low' ? 'bg-primary text-white' : 'hover:bg-surface-container-high bg-white text-on-surface'}`}
                                onClick={() => setPriority('low')}>
                                Low
                            </button>
                            <button
                                type="button"
                                className={`severity-pill h-12 rounded-full border border-outline-variant font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${priority === 'medium' ? 'bg-primary text-white' : 'hover:bg-surface-container-high bg-white text-on-surface'}`}
                                onClick={() => setPriority('medium')}>
                                Medium
                            </button>
                            <button
                                type="button"
                                className={`severity-pill h-12 rounded-full border border-outline-variant font-label-md text-label-md flex items-center justify-center gap-1 transition-all ${priority === 'critical' ? 'bg-error text-white' : 'hover:bg-red-50 bg-white text-on-surface'}`}
                                onClick={() => setPriority('critical')}>
                                <span className={`material-symbols-outlined text-sm ${priority !== 'critical' && 'hidden'}`} data-icon="warning">warning</span>
                                Critical
                            </button>
                        </div>
                        <p className={`mt-sm font-body-sm text-body-sm text-error flex items-center gap-1 ${priority === 'critical' ? '' : 'hidden'}`} id="critical-warning">
                            <span className="material-symbols-outlined text-sm" data-icon="info">info</span>
                            Select Critical only for life-threatening issues.
                        </p>
                    </div>
                </div>
            </section>
        </div>
      </main>
      
      <footer className="fixed bottom-0 left-0 w-full bg-white p-margin-mobile border-t border-outline-variant flex gap-4 z-50">
          <button className="flex-1 bg-primary-container text-white h-14 rounded-xl font-headline-sm text-headline-sm font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-primary-container/20">
              Submit Complaint
              <span className="material-symbols-outlined" data-icon="send">send</span>
          </button>
      </footer>
    </>
  );
}
