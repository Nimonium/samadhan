"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [role, setRole] = useState<'citizen' | 'officer' | 'admin' | 'cm'>('citizen');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        if (role === 'citizen') {
          router.push('/complaints/new');
        } else if (role === 'officer') {
          router.push('/officer/dashboard');
        } else if (role === 'cm') {
          router.push('/cm/dashboard');
        } else if (role === 'admin') {
          alert('Admin dashboard view is not part of this demo phase. Please login as CM Office or Officer.');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F4F6] min-h-screen flex flex-col justify-between overflow-x-hidden">
      <header className="bg-surface w-full px-4 md:px-[64px] h-16 flex justify-between items-center border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="text-[24px] leading-[32px] font-bold text-primary">Samadhan</span>
          <div className="h-6 w-[1px] bg-outline-variant mx-2"></div>
          <span className="text-[14px] leading-[16px] font-medium text-on-surface-variant">Govt. of Delhi</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="cursor-pointer active:scale-95 duration-200 p-2 hover:bg-surface-container-low transition-colors rounded-full flex items-center gap-1">
            <span className="text-[14px] leading-[16px] font-medium">English</span>
          </div>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-8 flex-col gap-6">
        <div className="w-full max-w-[480px] bg-white rounded-xl border border-outline-variant shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.05)] overflow-hidden">
          {/* Card Header */}
          <div className="pt-8 pb-6 px-8 text-center border-b border-outline-variant/30">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-surface-container flex items-center justify-center rounded-full overflow-hidden border border-outline-variant">
                <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500 font-bold">
                  SEAL
                </div>
              </div>
            </div>
            <h1 className="text-[24px] leading-[32px] font-medium text-on-surface mb-1">Delhi Grievance Portal</h1>
            <p className="text-[14px] leading-[20px] text-on-surface-variant uppercase tracking-wider">Citizen Centric Governance</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex w-full border-b border-outline-variant bg-surface-container-low">
            {(['citizen', 'officer', 'admin', 'cm'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-4 text-[14px] leading-[16px] font-medium transition-all ${
                  role === r
                    ? 'text-primary border-b-2 border-primary bg-white'
                    : 'text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                {r === 'cm' ? 'CM Office' : r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && <div className="text-error text-sm font-medium">{error}</div>}
            
            <div className="space-y-2">
              <label className="block text-[14px] leading-[16px] font-medium text-on-surface-variant ml-1">Phone number or Email</label>
              <div className="relative group">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-all placeholder:text-outline/60 text-on-surface text-[16px] leading-[24px]"
                  placeholder="Enter your credentials"
                  type="text"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[14px] leading-[16px] font-medium text-on-surface-variant">OTP / Password</label>
                <button type="button" className="text-[14px] leading-[16px] font-medium text-primary hover:underline cursor-pointer">Resend OTP?</button>
              </div>
              <div className="relative group">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-12 px-4 bg-white border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-all placeholder:text-outline/60 text-on-surface text-[16px] leading-[24px]"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary-container text-white text-[14px] leading-[16px] font-medium rounded-lg active:scale-[0.98] transition-transform shadow-md hover:bg-primary duration-200 disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Continue'}
            </button>
            
            <div className="text-center pt-4">
              <a onClick={() => alert('Registration is disabled for this demo phase. Please log in using the pre-seeded credentials.')} className="text-[16px] leading-[24px] text-primary hover:underline cursor-pointer">New citizen? Register here</a>
            </div>
          </form>

          {/* Security Badge Footer */}
          <div className="bg-surface-container px-8 py-4 flex items-center justify-center gap-2">
            <p className="text-[14px] leading-[16px] font-medium text-on-surface-variant">Secure Government Gateway</p>
          </div>
        </div>
      </main>
    </div>
  );
}
