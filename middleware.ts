/**
 * Next.js Edge Middleware — Route Guard terpusat
 * Berjalan di Vercel Edge Runtime sebelum halaman dirender.
 *
 * Strategi: semua halaman selain /dashboard (yang punya login form) memerlukan
 * cookie 'ivp_session' yang di-set saat login berhasil.
 * Jika tidak ada session, redirect ke /dashboard (halaman login utama).
 *
 * NOTE: localStorage tidak bisa dibaca di Edge — kita pakai cookie sebagai
 * sinyal session. Cookie di-set dari client saat login (lihat lib/auth.ts).
 */

import { NextRequest, NextResponse } from 'next/server';

/** Halaman yang boleh diakses tanpa session */
const PUBLIC_PATHS = ['/dashboard'];

/** Halaman yang butuh proteksi */
const PROTECTED_PREFIXES = [
  '/ticketing',
  '/reminder-schedule',
  '/form-review',
  '/form-require-project',
  '/learning-center',
  '/picket-showroom',
  '/daily-report',
  '/unit-movement',
  '/tech-note',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati: static files, API, _next internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // static files (favicon, images, dll)
  ) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Cek session cookie
  const session = request.cookies.get('ivp_session');
  if (!session?.value) {
    // Redirect ke dashboard (login) dengan hint halaman asal
    const loginUrl = new URL('/dashboard', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
