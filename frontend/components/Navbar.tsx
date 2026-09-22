
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout, isAuthenticated } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { TerminalSquare } from 'lucide-react';
import { api } from '@/lib/api';

export default function Navbar() {
  const [isAuth, setIsAuth] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ username: string, role: string } | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = isAuthenticated();
      setIsAuth(authStatus);
      if (authStatus) {
        try {
          const res = await api.get('/users/me/');
          setIsAdmin(res.data.role === 'ADMIN');
          setCurrentUser({
            username: res.data.username,
            role: res.data.role
          });
        } catch (err) {
          console.error("Failed to fetch user context");
        }
      }
    };
    checkAuth();
  }, [pathname]);

  if (!isAuth) return null;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold tracking-tight">
          <TerminalSquare size={20} />
          TRACKER
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block"
          >
            Dashboard
          </Link>

          {isAdmin && (
            <Link
              href="/register"
              className="text-sm font-medium text-black bg-gray-100 px-3 py-1 rounded hover:bg-gray-200 hidden sm:block"
            >
              Register Member
            </Link>
          )}

          {currentUser && (
            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 border border-gray-200 text-sm">
              <span className="font-semibold">{currentUser.username}</span>
              <span className="text-gray-300">|</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                ({currentUser.role})
              </span>
            </div>
          )}

          <button
            onClick={logout}
            className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
