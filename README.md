# SafeBuild AI — Smart Building Safety Audit & NOC Management System

A MERN-stack platform for digitizing building safety audits, compliance tracking,
and government NOC (No Objection Certificate) workflows across Structural,
Fire, Electrical, Plumbing, Lift, HVAC, Emergency Exit, Environmental, and
Occupational safety domains.

## Current build phase: Foundation

This is phase 1 of the build. It includes a fully working, production-quality
**foundation** — not every module from the full spec yet. What's implemented:

### Backend (`/backend`)
- Express + MongoDB (Mongoose) API
- JWT authentication with httpOnly cookie + Bearer token support
- 3 roles: `super_admin`, `auditor` (Government Safety Officer), `owner` (Building Owner)
- Register, Login, Logout, Get current user
- Email verification flow (Nodemailer)
- Forgot / Reset password flow
- Change password, update profile
- Role-based access control middleware (`protect` + `authorize`)
- Centralized error handling, rate limiting, CORS, cookie parsing
- Cloudinary + Multer upload middleware, ready to wire into any resource
- Socket.IO server, ready for real-time notifications
- Mongoose models for **all 13 collections** from the spec:
  Users, Buildings, BuildingImages, Audits, AuditChecklist, RiskScores,
  NOCApplications, Certificates, Notifications, Reports, Documents, Logs, Feedback
- Building CRUD API (create/list/get/update/delete) with QR code generation
- Dashboard stats API (top cards: buildings, audits, NOCs, compliance %, etc.)

### Frontend (`/frontend`)
- React (Vite) + Tailwind CSS, using the exact brand palette from the brief
  (`#F97316` primary, `#111827` dark sidebar, etc.) and Inter typography
- React Router with public + protected routes
- Auth context (login/register/logout/session restore)
- Auth pages: Login, Register, Forgot Password, Reset Password, Verify Email
- Dashboard shell: sticky dark sidebar (role-aware nav), sticky topbar with
  search + notifications + profile menu
- Dashboard home page: stat cards + Monthly Audits area chart + Risk
  Distribution pie chart (Recharts), wired to the live `/api/dashboard/stats` endpoint
- Public landing page: hero, CTAs, stats band, FAQ, footer
- Placeholder pages for modules planned for the next phase (Buildings,
  Safety Audits, NOC Applications, Documents, Certificates, Reports,
  Analytics, Notifications, Users, Settings) so navigation is fully wired
  and ready to be filled in one module at a time

### Not yet built (next phases)
- Safety Audit checklist flow (per-category pass/warning/fail + media uploads)
- NOC application workflow + status timeline
- Certificate PDF generation + QR verification
- Document management with version history
- AI features (risk prediction, compliance suggestions, chat assistant, etc.)
- Reports export (PDF/Excel/CSV), Analytics dashboards
- Real-time notifications wired to Socket.IO
- Admin panel screens (the API routes for user management already exist)

---

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env   # fill in your MongoDB URI, JWT secret, SMTP, Cloudinary keys
npm install
npm run dev             # starts on http://localhost:5000
```

You need a running MongoDB instance (local or Atlas) and a `MONGO_URI` in `.env`.
SMTP and Cloudinary credentials are only required once you exercise email or
upload features — the server will still boot without them.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev              # starts on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no
extra CORS config is needed in development.

### 3. First account

Register through the UI (`/register`) — this creates a `owner` account and
sends a verification email. To create the first `super_admin` or `auditor`
account, either:
- Temporarily change the `role` in MongoDB for a registered user, or
- Add a one-off seed script (recommended for phase 2)

---

## Project structure

```
safebuild-ai/
├── backend/
│   ├── config/          # db connection, shared enums/constants
│   ├── controllers/      # request handlers
│   ├── middleware/       # auth, role guard, error handler, upload
│   ├── models/            # Mongoose schemas (13 collections)
│   ├── routes/            # Express routers
│   ├── utils/              # token/email helpers
│   └── server.js
└── frontend/
    └── src/
        ├── api/            # axios instance
        ├── components/     # layout, auth, ui, ProtectedRoute
        ├── context/         # AuthContext
        ├── pages/            # Landing, Dashboard, auth pages, placeholders
        └── utils/             # zod validation schemas
```

## Next step

Tell me which module to build next (Buildings management UI, Safety Audits
checklist, or NOC workflow are the natural next pieces), and it'll be built
end-to-end: API + UI + validation, following this same foundation.
