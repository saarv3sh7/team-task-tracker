
"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { format } from 'date-fns';
import { Activity } from 'lucide-react';

interface ActivityLog {
  id: number;
  username: string;
  message: string;
  timestamp: string;
}

export default function ActivityTimeline({ teamId }: { teamId: number }) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await api.get(`/activities/?team_id=${teamId}`);
        setActivities(res.data);
      } catch (err) {
        console.error("Failed to fetch activities");
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [teamId]);

  return (
    <div className="border border-gray-200 bg-gray-50/50 p-5 h-full min-h-[500px] flex flex-col">
      <div className="flex items-center gap-2 border-b border-gray-200 pb-3 mb-4">
        <Activity size={16} />
        <h2 className="font-bold uppercase text-xs tracking-wider">
          Team Timeline
        </h2>
      </div>

      <div className="overflow-y-auto flex-1 space-y-5 pr-2">
        {activities.map((act) => {
          const match = act.message.match(
            /^moved\s+['"](.+?)['"]\s+to\s+(.+)$/i
          );

          return (
            <div
              key={act.id}
              className="relative pl-4 border-l-2 border-gray-200"
            >
              <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-black"></div>

              <p className="text-sm">
                <span className="font-semibold">{act.username}</span>{' '}

                {match ? (
                  <>
                    changed status of “{match[1]}” to{' '}
                    <span className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2 py-0.5 text-xs font-semibold text-gray-700">
                      {match[2]}
                    </span>
                  </>
                ) : (
                  act.message
                )}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(act.timestamp), 'MMM d, yyyy, h:mm a')}
              </p>
            </div>
          );
        })}

        {activities.length === 0 && (
          <p className="text-sm text-gray-500 italic">
            No recent activity for this team.
          </p>
        )}
      </div>
    </div>
  );
}
