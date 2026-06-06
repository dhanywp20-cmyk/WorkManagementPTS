'use client';

import { useState, useEffect } from 'react';
import { getSession, startSessionWatcher } from '@/lib/auth';
import { User } from '@/app/dashboard/_components/shared';
import DashboardKPI from './_components/DashboardKPI';

// ─── Loading Screen ───────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center w-full h-screen"
      style={{
        backgroundImage: "url('/IVP_Background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
      <div className="flex flex-col items-center gap-4 px-10 py-8 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
          style={{ borderColor: 'rgba(226,168,75,0.25)', borderTopColor: '#e2a84b' }} />
        <p className="text-slate-500 text-sm font-semibold tracking-wide">Memuat Dashboard...</p>
      </div>
    </div>
  );
}

// ─── Unauthorized Screen ──────────────────────────────────────────────────────
function UnauthorizedScreen() {
  return (
    <div className="flex items-center justify-center w-full h-screen"
      style={{
        backgroundImage: "url('/IVP_Background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}>
      <div className="text-center px-10 py-8 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.92)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
        <div className="text-5xl mb-3">🔒</div>
        <p className="font-bold text-base text-slate-700">Akses Ditolak</p>
        <p className="text-sm mt-1 text-slate-400">Anda tidak memiliki izin untuk mengakses halaman ini.</p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [ready,       setReady]       = useState(false);
  const [authorized,  setAuthorized]  = useState(false);

  useEffect(() => {
    const user = getSession<User>();
    if (!user) {
      // Tidak ada sesi — redirect ke dashboard utama
      const target = window.top !== window ? window.top : window;
      if (target) target.location.href = '/dashboard';
      return;
    }

    // Cek akses: admin, superadmin, supervisor, atau team dengan izin dashboard
    const role = user.role?.toLowerCase() ?? '';
    const isAdmin      = ['admin', 'superadmin'].includes(role);
    const isPTSSup     = role === 'team'
      && ['Team PTS', 'Team PTS UMP', 'Team PTS MLDS'].includes(user.team_type ?? '')
      && user.jabatan === 'Supervisor';
    const isSalesSup   = ['guest', 'sales'].includes(role)
      && ['Supervisor', 'Manager', 'Deputy General Manager', 'General Manager', 'Direktur']
          .includes(user.jabatan ?? '');
    const hasTeamAccess = role === 'team'
      && (user.allowed_menus ?? []).includes('dashboard');

    const canAccess = isAdmin || isPTSSup || isSalesSup || hasTeamAccess;

    setCurrentUser(user);
    setAuthorized(canAccess);
    setReady(true);

    // Session watcher: auto-logout jika expired
    return startSessionWatcher();
  }, []);

  if (!ready) return <LoadingScreen />;
  if (!authorized || !currentUser) return <UnauthorizedScreen />;

  return (
    <div
      className="w-full min-h-screen"
      style={{
        backgroundImage: "url('/IVP_Background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="relative z-10 p-5">
        <DashboardKPI currentUser={currentUser} />
      </div>
    </div>
  );
}
