"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Link from 'next/link';
import { TerminalSquare, ArrowLeft } from 'lucide-react';

export default function RegisterMember() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    
    try {
      await api.post('/users/register/', {
        username,
        email,
        first_name: firstName,
        last_name: lastName,
        password,
        role
      });

      setMsg({ text: 'User successfully created!', type: 'success' });
      setUsername('');
      setEmail('');
      setFirstName('');
      setLastName('');
      setPassword('');
    } catch (err: any) {
      setMsg({ 
        text: err.response?.status === 403 
          ? "Only Admins can register new users." 
          : "Failed to create user. Username might be taken.", 
        type: 'error' 
      });
    }
  };

  return (
    <div className="flex h-[80vh] items-center justify-center relative">
      <div className="absolute top-0 left-0 mt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm font-medium hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" /> Back to Dashboard
        </Link>
      </div>

      <div className="w-full max-w-sm border border-gray-200 p-8 shadow-sm">
        <div className="flex justify-center mb-6">
          <TerminalSquare size={32} />
        </div>

        <h1 className="text-xl font-bold text-center mb-1 tracking-tight">
          Register Member
        </h1>

        {msg.text && (
          <div
            className={`p-3 mb-4 text-sm text-center ${
              msg.type === 'error'
                ? 'bg-black text-white'
                : 'bg-gray-100 text-black border border-gray-300'
            }`}
          >
            {msg.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              Username
            </label>
            <input
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              className="input-field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              className="input-field"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              className="input-field"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              Password
            </label>
            <input
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wider">
              Role
            </label>
            <select
              className="input-field"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <button type="submit" className="btn-primary w-full mt-2">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
}