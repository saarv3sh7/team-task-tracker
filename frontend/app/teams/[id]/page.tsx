
"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import ActivityTimeline from "@/components/ActivityTimeline";

interface Task {
  id: number;
  title: string;
  description?: string;
  status: string;
  team: number;
  assignee_detail: any;
}

export default function TeamView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [team, setTeam] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");

  const router = useRouter();

  // Next.js dynamic params are now a Promise
  const { id } = use(params);
  const teamId = parseInt(id, 10);

  useEffect(() => {
    if (isNaN(teamId)) {
      router.push("/dashboard");
      return;
    }

    fetchTeamAndTasks();
  }, [teamId]);

  const fetchTeamAndTasks = async () => {
    try {
      const [teamRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/teams/${teamId}/`),
        api.get("/tasks/"),
        api.get("/users/list/"),
      ]);

      console.log("========== TEAM DEBUG ==========");
      console.log("Current teamId:", teamId);
      console.log("Current teamId type:", typeof teamId);
      console.log("Team response:", teamRes.data);

      console.log("========== TASKS DEBUG ==========");
      console.log("Raw tasks response:", tasksRes.data);
      console.log("Number of tasks:", tasksRes.data.length);

      tasksRes.data.forEach((t: Task) => {
        console.log("Task:", {
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          team: t.team,
          teamType: typeof t.team,
          currentTeamId: teamId,
          currentTeamIdType: typeof teamId,
          teamMatchesStrictly: t.team === teamId,
          teamMatchesAsNumber: Number(t.team) === teamId,
        });
      });

      const filteredTasks = tasksRes.data.filter(
        (t: Task) => t.team === teamId
      );

      console.log("========== FILTER RESULT ==========");
      console.log("Filtered tasks:", filteredTasks);
      console.log("Filtered task count:", filteredTasks.length);

      console.log("========== STATUS DEBUG ==========");
      filteredTasks.forEach((t: Task) => {
        console.log({
          id: t.id,
          title: t.title,
          status: t.status,
          isPending: t.status === "PENDING",
          isInProgress: t.status === "IN_PROGRESS",
          isDone: t.status === "DONE",
        });
      });

      console.log("===================================");

      setTeam(teamRes.data);
      setTasks(filteredTasks);
      setAllUsers(usersRes.data);
    } catch (err: any) {
      console.error("Failed to load team data");
      console.error("Status:", err.response?.status);
      console.error("URL:", err.config?.url);
      console.error("Response:", err.response?.data);
      console.error("Full error:", err);

      // Only redirect if the team itself was not found
      if (err.config?.url?.includes(`/teams/${teamId}/`)) {
        router.push("/dashboard");
      }
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    try {
      await api.post(`/teams/${teamId}/invite/`, {
        user_id: parseInt(selectedUserId),
      });

      setSelectedUserId("");
      fetchTeamAndTasks();
    } catch (err: any) {
      console.error("Failed to add member", err);
      alert(
        err.response?.data?.error ||
          "Only Admins can invite team members."
      );
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTaskTitle.trim()) return;

    try {
      console.log("========== CREATE TASK ==========");
      console.log("Creating task with:", {
        title: newTaskTitle,
        description: newTaskDesc,
        team: teamId,
        teamType: typeof teamId,
        status: "PENDING",
      });

      const createResponse = await api.post("/tasks/", {
        title: newTaskTitle,
        description: newTaskDesc,
        team: teamId,
        status: "PENDING",
      });

      console.log("Task creation response:", createResponse.data);
      console.log("=================================");

      setNewTaskTitle("");
      setNewTaskDesc("");
      fetchTeamAndTasks();
    } catch (err: any) {
      console.error(
        "Failed to create task:",
        err.response?.data || err
      );
    }
  };

  const updateTaskStatus = async (
    taskId: number,
    newStatus: string
  ) => {
    try {
      await api.patch(`/tasks/${taskId}/`, {
        status: newStatus,
      });

      fetchTeamAndTasks();
    } catch (err: any) {
      console.error(
        "Failed to update status:",
        err.response?.data || err
      );
    }
  };

  if (!team) {
    return <div className="p-8 text-sm">Loading workspace...</div>;
  }

  const columns = [
    { id: "PENDING", label: "Pending" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "DONE", label: "Done" },
  ];

  return (
    <div className="mt-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center text-sm font-medium hover:underline mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Dashboard
      </Link>

      <div className="mb-8 border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {team.name}
        </h1>

        <p className="text-gray-600 mt-2">
          {team.description}
        </p>

        {/* Team Members + Invite Member */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              Members:
            </span>

            {team.members_detail.map(
              (member: any, index: number) => (
                <span
                  key={member.id}
                  className="text-sm text-gray-600"
                >
                  {member.username}
                  {index < team.members_detail.length - 1 && ","}
                </span>
              )
            )}
          </div>

          <form
            onSubmit={handleInvite}
            className="flex gap-2 ml-auto"
          >
            <select
              className="input-field py-1 text-sm min-w-[150px]"
              value={selectedUserId}
              onChange={(e) =>
                setSelectedUserId(e.target.value)
              }
            >
              <option value="">
                Select user to invite...
              </option>

              {allUsers
                .filter(
                  (u) =>
                    !team.members_detail.some(
                      (m: any) => m.id === u.id
                    )
                )
                .map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.username}
                  </option>
                ))}
            </select>

            <button
              type="submit"
              className="btn-primary py-1 px-3 text-xs"
            >
              Invite
            </button>
          </form>
        </div>
      </div>

      {/* Create New Task */}
      <form
        onSubmit={handleCreateTask}
        className="mb-8 w-full border border-gray-200 p-4 bg-gray-50/50"
      >
        <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
          Create New Task
        </h3>

        <div className="flex w-full items-center gap-3">
          <input
            type="text"
            placeholder="Task title (What needs to be done?)"
            className="input-field h-10 flex-1 min-w-0"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Task description (optional)"
            className="input-field h-10 flex-1 min-w-0"
            value={newTaskDesc}
            onChange={(e) => setNewTaskDesc(e.target.value)}
          />

          <button
            type="submit"
            className="btn-primary h-10 px-5 flex shrink-0 items-center justify-center gap-1"
          >
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </form>

      {/* Kanban Board + Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Kanban Board takes up 3 columns */}
        <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => (
            <div
              key={col.id}
              className="bg-gray-50/50 border border-gray-200 p-4 min-h-[500px]"
            >
              <h2 className="text-xs font-bold uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">
                {col.label} (
                {tasks.filter((t) => t.status === col.id).length})
              </h2>

              <div className="space-y-3">
                {tasks
                  .filter((t) => t.status === col.id)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="bg-white border border-gray-200 p-4 shadow-sm hover:border-black transition-colors group"
                    >
                      <Link
                        href={`/tasks/${task.id}`}
                        className="block font-medium mb-2 group-hover:underline"
                      >
                        {task.title}
                      </Link>

                      {/* Short Task Description */}
                      {task.description && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      <div className="flex gap-2 text-xs font-medium">
                        {col.id !== "PENDING" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                "PENDING"
                              )
                            }
                            className="text-gray-500 hover:text-black"
                          >
                            ← Pending
                          </button>
                        )}

                        {col.id !== "IN_PROGRESS" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                "IN_PROGRESS"
                              )
                            }
                            className="text-gray-500 hover:text-black"
                          >
                            {col.id === "PENDING"
                              ? "Start →"
                              : "← In Progress"}
                          </button>
                        )}

                        {col.id !== "DONE" && (
                          <button
                            onClick={() =>
                              updateTaskStatus(
                                task.id,
                                "DONE"
                              )
                            }
                            className="text-gray-500 hover:text-black"
                          >
                            Done →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Timeline takes up 1 column on the right */}
        <div className="xl:col-span-1">
          <ActivityTimeline teamId={teamId} />
        </div>
      </div>
    </div>
  );
}