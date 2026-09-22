"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { setTokens } from '@/lib/auth';
import Link from 'next/link';
import { TerminalSquare } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await api.post('/users/login/', { username, password });
      setTokens(res.data.access, res.data.refresh);
      router.push('/dashboard');
    } catch (err: any) {
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        setError(err.response.status === 401 
          ? 'Invalid credentials. Please try again.' 
          : `Server error: ${err.response.status} (Check Django terminal)`);
      } else {
        // The server didn't respond at all (Server is off or CORS error)
        setError('Network error: Is the Django server running?');
      }
    }
  };

  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <TerminalSquare size={32} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6 tracking-tight">Sign In</h1>
        
        {error && <div className="bg-black text-white text-sm p-3 mb-4 text-center">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Username</label>
            <input 
              type="text" 
              className="input-field" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">Password</label>
            <input 
              type="password" 
              className="input-field" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}