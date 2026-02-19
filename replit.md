# Global Visas - Visa Application Portal

## Overview
A secure multi-step visa application management system for Global Visas. Users can sign up with email/OTP verification, fill out a 20-step Visitor Visa (Subclass 600) application form, track their application status, and upload supporting documents. Admins can manage all applications, update statuses, and communicate with applicants.

## Current State
- **All 20 form steps complete** plus Step 21 (Review) and Step 22 (Attach Documents)
- **Document uploads**: Per-category uploads (Required: Travel Document, National ID, Previous Travel; Recommended: Family Register, Tourism Evidence, Financial Evidence)
- **Admin features**: View application details, upload documents on behalf of applicants, submit applications on behalf, update status with notes
- **Email**: Nodemailer configured but SMTP credentials not yet provided. OTP codes are logged to server console for now.

## Brand
- Colors: #02ACE2 (light blue), #0C51AC (dark blue)
- Logo: `attached_assets/GLOBAL-VISA-logo_1771013259487.webp`
- Font: Inter

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + Shadcn UI + Wouter (routing) + TanStack Query
- **Backend**: Express.js + express-session (connect-pg-simple)
- **Database**: PostgreSQL via Drizzle ORM
- **Auth**: bcryptjs for password hashing, 6-digit OTP via email, session-based
- **File Storage**: Replit Object Storage for document uploads
- **Email**: Nodemailer (SMTP config via env vars)

## Key Files
- `shared/schema.ts` - Database schema (users, otpCodes, applications, documents)
- `server/routes.ts` - All API routes (auth, applications, admin, documents)
- `server/storage.ts` - Database CRUD operations (IStorage interface + DatabaseStorage)
- `server/email.ts` - Email notification system (OTP, status updates, admin alerts)
- `server/db.ts` - Database connection
- `client/src/App.tsx` - Main app with routing (public/protected/admin routes)
- `client/src/lib/auth.tsx` - AuthProvider context + useAuth hook
- `client/src/pages/login.tsx` - Login page with OTP verification
- `client/src/pages/signup.tsx` - Signup page with email verification
- `client/src/pages/dashboard.tsx` - Applicant dashboard (my applications)
- `client/src/pages/application.tsx` - Form wizard (Steps 1-22 including Review and Attach Documents)
- `client/src/pages/application-view.tsx` - View submitted application status
- `client/src/pages/admin.tsx` - Admin dashboard (manage all applications)
- `client/src/pages/admin-application.tsx` - Admin per-application detail view with document management

## Admin Credentials
- Username: admin (or email: shaan.codereve@gmail.com)
- Password: admin
- Seeded via `script/seed-admin.ts`

## Environment Variables Needed
- `SMTP_HOST` - SMTP server hostname
- `SMTP_PORT` - SMTP port (587 for TLS, 465 for SSL)
- `SMTP_USER` - SMTP username/email
- `SMTP_PASS` - SMTP password
- `SMTP_FROM` - From email address (optional, defaults to SMTP_USER)
- `SESSION_SECRET` - Session encryption secret (auto-generated fallback exists)

## Recent Changes
- 2026-02-19: Added webhook integration - POST to configurable WEBHOOK_URL on application submit (both user and admin). Includes HMAC signature (X-Webhook-Signature) when WEBHOOK_SECRET is set, 10s timeout, duplicate submit guard. Default URL: https://platform.seogent.io/webhook/immi-visa-application-submission
- 2026-02-17: Separated admin and user login - /admin/login is dedicated admin portal, /login is for regular users only. Admin accounts blocked from regular login. Admin password auto-resets on every server startup.
- 2026-02-17: Fixed admin login - login route now supports username lookup (not just email), reset admin passwords to "admin". Admin credentials: username "admin" or email "shaan.codereve@gmail.com", password "admin"
- 2026-02-17: Added Step 22 (Attach Documents) with per-category uploads, admin application detail page with document management, login supports username for admin
- 2026-02-13: Initial build - full auth system, all 20 form steps, Step 21 Review, dashboards, email system

## User Preferences
- Build step by step - user provides screenshots for each form step
- Clean, modern design - don't copy immi.gov design exactly
- Must be secure and production-ready
- Easy for future updates
