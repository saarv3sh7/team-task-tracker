
"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Users, Plus } from 'lucide-react';

interface Team {
  id: number;
  name: string;
  description: string;
  members_detail: any[];
}

export default function Dashboard() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDesc, setNewTeamDesc] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    initializeDashboard();
  }, [router]);

  const initializeDashboard = async () => {
    try {
      // 1. Check who is logged in
      const userRes = await api.get('/users/me/');
      const userIsAdmin = userRes.data.role === 'ADMIN';
      setIsAdmin(userIsAdmin);

      // 2. Fetch Teams
      const teamsRes = await api.get('/teams/');
      setTeams(teamsRes.data);

      // 3. If Admin, fetch all users for the directory
      if (userIsAdmin) {
        const usersRes = await api.get('/users/list/');
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/teams/', {
        name: newTeamName,
        description: newTeamDesc
      });

      setNewTeamName('');
      setNewTeamDesc('');
      initializeDashboard();
    } catch (err: any) {
      setError(
        err.response?.status === 403
          ? "Only Admins can create new teams."
          : "Failed to create team."
      );
    }
  };

  // Admins first, then members.
  // Within each role, sort alphabetically by username.
  const sortedUsers = [...allUsers].sort((a, b) => {
    const roleA = a.role === 'ADMIN' ? 0 : 1;
    const roleB = b.role === 'ADMIN' ? 0 : 1;

    if (roleA !== roleB) {
      return roleA - roleB;
    }

    return String(a.username).localeCompare(
      String(b.username),
      undefined,
      { sensitivity: 'base' }
    );
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">

      {/* Left Column: Teams */}
      <div
        className={
          isAdmin
            ? "lg:col-span-2"
            : "col-span-1 lg:col-span-3"
        }
      >
        <h1 className="text-3xl font-bold tracking-tight mb-8">
          Dashboard
        </h1>

        {error && (
          <div className="bg-black text-white p-3 text-sm mb-6">
            {error}
          </div>
        )}

        {/* Create Workspace */}
        {isAdmin && (
          <form
            onSubmit={handleCreateTeam}
            className="mb-8 border border-gray-200 p-4 bg-gray-50/50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">

              <div className="shrink-0">
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Create Workspace
                </h3>
              </div>

              <input
                type="text"
                placeholder="Workspace Name"
                className="input-field flex-1 min-w-0"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                required
              />

              <input
                type="text"
                placeholder="Workspace Description"
                className="input-field flex-[1.5] min-w-0"
                value={newTeamDesc}
                onChange={(e) => setNewTeamDesc(e.target.value)}
                required
              />

              <button
                type="submit"
                className="btn-primary flex items-center justify-center gap-1 whitespace-nowrap px-5"
              >
                <Plus size={16} />
                Create
              </button>

            </div>
          </form>
        )}

        <h2 className="font-semibold text-sm uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
          Your Workspaces
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {teams.map((team) => (
            <Link
              key={team.id}
              href={`/teams/${team.id}`}
              className="group block border border-gray-200 p-5 hover:border-black transition-all hover:shadow-sm"
            >
              <h3 className="font-bold text-lg mb-1 group-hover:underline underline-offset-4">
                {team.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {team.description}
              </p>

              <div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase">
                <span>
                  {team.members_detail?.length || 0} Members
                </span>

                <span className="text-black opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
            </Link>
          ))}

          {teams.length === 0 && (
            <div className="col-span-full py-8 text-center border border-dashed border-gray-300 text-sm text-gray-500">
              You are not part of any teams yet.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Member Directory (Admins Only) */}
      {isAdmin && (
        <div className="hidden lg:block border border-gray-200 bg-white p-5">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} />

              <h2 className="font-bold uppercase text-xs tracking-wider">
                Organization Directory
              </h2>
            </div>

            <span className="text-xs font-semibold bg-gray-100 px-2 py-1">
              {allUsers.length}
            </span>
          </div>

          <div className="space-y-4">
            {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {user.first_name || user.last_name
                      ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        + ` (${user.username})`
                      : user.username}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 border ${
                    user.role === 'ADMIN'
                      ? 'border-black text-black'
                      : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
