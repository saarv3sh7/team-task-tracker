# Team Task Tracker

## About
A full-stack, role-based project management platform built to help teams organize tasks, collaborate effectively, and stay up to date with project activity in real time. The application uses a Django and MongoDB backend with a modern Next.js frontend, providing secure Role-Based Access Control (RBAC), an interactive Kanban board, and a chronological activity timeline. The interface is designed with a clean, minimal approach focused on usability, clarity, and a professional user experience.

---

# Features

## DAuthentication & Authorization
- **Role-Based Access Control (RBAC):** Distinct Admin and Member roles.
- **JWT Security:** Secure stateless authentication with automatic refresh-token handling and frontend interceptors.
- **Admin Privileges:** Only administrators can create new workspaces and register or invite new members.

## Team & Task Management
- **Workspace Isolation:** Users only see and access tasks within the teams they belong to.
- **Kanban Board:** Dynamic task organization across Pending, In Progress, and Done statuses.
- **Simulated Email Invites:** Backend intercepts admin invitations and dynamically logs simulated email deliveries to the terminal.
- **Collaboration:** Dedicated comment threads on individual tasks.

## Live Activity Timeline
- **Granular Event Tracking:** The system autonomously logs specific actions (e.g., “admin moved 'Build UI' to In Progress”, “admin assigned 'Database' to dev_user1”).
- **Real-Time Polling:** The frontend aggressively polls the server every 5 seconds to provide a real-time, live-updating timeline experience.
- **Team-Specific Filtering:** Activity timelines are completely isolated per team workspace.

## Frontend UI/UX
- **Minimal UI:** Clean, black-and-white, border-driven design.
- **CModern Next.js Architecture:** Built utilizing the latest App Router paradigm.
- **Responsive Design:** Fully styled using Tailwind CSS v4.
- **Cross-Origin Support:** Fully configured CORS mapping for local development.

---

# Tech Stack

## Backend & Infrastructure
- Python 3
- Django 4.1.x
- Django REST Framework (DRF)
- SimpleJWT (Authentication)
- MongoDB (Database)
- Djongo & PyMongo (Django-to-MongoDB translation)

## Frontend
- Next.js (App Router)
- React
- Tailwind CSS v4
- Axios (API Interceptors)
- Date-fns (Timestamp formatting)
- Lucide React (Icons)

---

# Project Structure

```text
team-task-tracker/
│
├── backend/               # Django REST API
│   ├── config/            # Core settings & routing
│   ├── users/             # Auth, RBAC, Custom User models
│   ├── teams/             # Workspace models & Invite endpoints
│   ├── tasks/             # Task & Comment models
│   ├── activities/        # Timeline logging utility
│   └── manage.py
│
└── frontend/              # Next.js UI
    ├── app/               
    │   ├── login/         # Auth pages
    │   ├── register/      
    │   ├── dashboard/     # Workspace hub
    │   ├── teams/[id]/    # Kanban board view
    │   └── tasks/[id]/    # Task details & comments
    ├── components/        # Navbar, ActivityTimeline
    ├── lib/               # Axios interceptors, Auth utilities
    └── tailwind.config.js

```

---

# API Endpoints

##Authentication & Users

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/users/login/` | Returns JWT access and refresh tokens |
| POST | `/api/users/register/` | Admin-only: Creates a new user |
| GET | `/api/users/me/` | Retrieves the current logged-in user context |
| GET | `/api/users/list/` | Retrieves all users for dropdown invitations |

## Teams & Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| GET/POST | `/api/teams/` | List user's teams or create a new team (Admin) |
| GET | `/api/teams/{id}/invite/` | Invites a user and triggers terminal email |
| GET/POST | `/api/tasks/` | List team tasks or create a new task) |
| PATCH | `/api/tasks/{id}/` | Update task status, assignee, or details |
| POST | `/api/comments/` | Append a comment to a specific task |

##Activity Tracking

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/activities/?team_id={id}` | Fetches recent chronological logs for a team |

---

# Future Enhancements

* **DWebSockets Integration:** Replace the 5-second HTTP polling mechanism with Django Channels / Socket.io for true real-time, zero-latency timeline updates.
* **Actual Email Integration:** Wire the terminal-simulated email function to SendGrid or AWS SES for production-ready invitations.
* **File Attachments:** Allow users to upload images and documents directly to task cards using AWS S3.
* **Dark Mode:** Implement a Tailwind-native dark mode toggle to complement the minimalist design.

---

# Author

Sarvesh Yeutkar

M.Tech CSE (Information Security)  
COEP Technological University
