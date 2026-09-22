
"use client";

import { use, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function TaskView({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [task, setTask] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();

  // Next.js 15+ params is a Promise
  const { id } = use(params);
  const taskId = Number(id);

  useEffect(() => {
    if (!Number.isInteger(taskId)) {
      setError("Invalid task ID.");
      setLoading(false);
      return;
    }

    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("Fetching task:", `/tasks/${taskId}/`);

      const res = await api.get(`/tasks/${taskId}/`);

      console.log("Task response:", res.data);

      setTask(res.data);

      // Fetch team members so the assignee dropdown is fully populated
      if (res.data.team) {
        const teamRes = await api.get(`/teams/${res.data.team}/`);
        setTeamMembers(teamRes.data.members_detail || []);
      }
    } catch (err: any) {
      console.error("Failed to load task:", err);
      console.error("Status:", err.response?.status);
      console.error("Response:", err.response?.data);
      console.error("URL:", err.config?.url);

      setError(
        err.response?.data?.detail ||
          `Failed to load task. Server returned ${
            err.response?.status || "an error"
          }.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    try {
      await api.patch(`/tasks/${taskId}/`, {
        status: e.target.value,
      });

      await fetchTask();
    } catch (err: any) {
      console.error("Failed to update status:", err);
      console.error("Response:", err.response?.data);
    }
  };

  const handleAssigneeChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newAssigneeId = e.target.value
      ? parseInt(e.target.value)
      : null;

    try {
      await api.patch(`/tasks/${taskId}/`, {
        assignee: newAssigneeId,
      });

      fetchTask();
    } catch (err) {
      console.error("Failed to assign task", err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    try {
      await api.post("/comments/", {
        task: taskId,
        text: newComment.trim(),
      });

      setNewComment("");
      await fetchTask();
    } catch (err: any) {
      console.error("Failed to add comment:", err);
      console.error("Response:", err.response?.data);
    }
  };

  if (loading) {
    return <div className="p-8 text-sm">Loading task...</div>;
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto mt-8 p-8">
        <div className="border border-red-200 bg-red-50 p-6">
          <h1 className="font-bold text-red-700 mb-2">
            Failed to load task
          </h1>

          <p className="text-sm text-red-600 mb-4">{error}</p>

          <p className="text-xs text-gray-500 mb-4">
            Requested: <code>/tasks/{taskId}/</code>
          </p>

          <button
            onClick={fetchTask}
            className="btn-primary mr-3"
          >
            Try Again
          </button>

          <button
            onClick={() => router.back()}
            className="text-sm underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!task) {
    return <div className="p-8 text-sm">Task not found.</div>;
  }

  return (
    <div className="mt-6 max-w-3xl mx-auto">
      <Link
        href={`/teams/${task.team}`}
        className="inline-flex items-center text-sm font-medium hover:underline mb-6"
      >
        <ArrowLeft size={16} className="mr-1" />
        Back to Board
      </Link>

      <div className="border border-gray-200 p-8 shadow-sm relative">
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold tracking-tight pr-8">
            {task.title}
          </h1>

          <select
            className="input-field py-1 px-2 text-xs font-bold uppercase tracking-wider cursor-pointer w-auto"
            value={task.status}
            onChange={handleStatusChange}
          >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <p className="text-sm text-gray-500">
            Created{" "}
            {format(new Date(task.created_at), "MMM d, yyyy, h:mm a")}
          </p>

          <div className="h-4 w-px bg-gray-300"></div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Assignee:
            </span>

            <select
              className="input-field py-1 px-2 text-sm w-auto border-transparent hover:border-gray-300 focus:border-black bg-transparent cursor-pointer"
              value={task.assignee || ""}
              onChange={handleAssigneeChange}
            >
              <option value="">Unassigned</option>

              {teamMembers.map((member: any) => (
                <option key={member.id} value={member.id}>
                  {member.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Full Task Description */}
        <div className="border-t border-gray-200 pt-6 mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Description
          </h2>

          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {task.description || "No description provided."}
          </p>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <h2 className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider mb-6">
            <MessageSquare size={16} />
            Comments ({task.comments?.length || 0})
          </h2>

          <div className="space-y-6 mb-8">
            {task.comments?.map((comment: any) => (
              <div
                key={comment.id}
                className="bg-gray-50/50 border border-gray-200 p-4"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-sm">
                    {comment.author_name}
                  </span>

                  <span className="text-xs text-gray-500">
                    {format(
                      new Date(comment.created_at),
                      "MMM d, yyyy, h:mm a"
                    )}
                  </span>
                </div>

                <p className="text-sm">{comment.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment}>
            <textarea
              className="input-field min-h-[100px] mb-3 resize-y"
              placeholder="Leave a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
            />

            <button type="submit" className="btn-primary">
              Post Comment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}