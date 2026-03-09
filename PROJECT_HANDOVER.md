# Global Visas — Complete Project Handover Document

**Last Updated:** February 27, 2026
**GitHub Repository:** https://github.com/shaancodereve-a11y/global-visas.git

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [What Was Built (Summary)](#2-what-was-built)
3. [Technical Architecture](#3-technical-architecture)
4. [Complete File Structure](#4-complete-file-structure)
5. [Database Schema](#5-database-schema)
6. [All 22 Form Steps (Detailed)](#6-all-22-form-steps)
7. [API Routes Reference](#7-api-routes-reference)
8. [Authentication System](#8-authentication-system)
9. [Admin System](#9-admin-system)
10. [Webhook Integration](#10-webhook-integration)
11. [Email System](#11-email-system)
12. [Document Upload System](#12-document-upload-system)
13. [Environment Variables](#13-environment-variables)
14. [Setting Up on a New Replit Account](#14-setting-up-on-new-replit-account)
15. [Deploying to Hostinger VPS (dev88.space)](#15-deploying-to-hostinger-vps)
16. [Pending / Incomplete Items](#16-pending-incomplete-items)
17. [For the Automation Engineer](#17-for-the-automation-engineer)
18. [Brand & Design](#18-brand-and-design)
19. [Troubleshooting](#19-troubleshooting)

---

## 1. Project Overview

**Global Visas** is a secure, production-ready visa application management system that replicates Australia's immi.gov.au Visitor Visa (Subclass 600) application form.

**Key Features:**
- 20-step visa application form (plus Review step and Attach Documents step = 22 total)
- Applicant portal with dashboard to track applications
- Admin dashboard to manage all applications, update statuses, and communicate with applicants
- Email notifications (OTP verification, status updates)
- Webhook integration for n8n/automation workflows
- Document upload system with categorized file management
- Separate login portals for admins and applicants
- Fully mobile-responsive design

**Live URL:** https://dev88.space (Hostinger VPS, Node.js on port 5000 via Nginx proxy)

---

## 2. What Was Built

### Timeline of Development

1. **Initial Build** — Full auth system (signup, login, OTP email verification), all 20 form steps, Step 21 (Review), applicant dashboard, admin dashboard, email notification system
2. **Step 22 Added** — Attach Documents step with per-category uploads (Required: Travel Document, National ID, Previous Travel; Recommended: Family Register, Tourism Evidence, Financial Evidence)
3. **Admin Enhancements** — Admin application detail page, admin can upload documents on behalf of applicants, admin can submit applications on behalf, admin status updates with notes
4. **Login Separation** — `/admin/login` is a dedicated admin portal, `/login` is for regular users only. Admin accounts are blocked from regular login.
5. **Webhook Integration** — POST to configurable URL on application submit with HMAC signature, 10s timeout, duplicate submit guard. Payload is fully flattened with all form fields as top-level keys.
6. **Webhook Data Fix** — Fixed applicant metadata fields (full_name, username, verified) to map correctly from database columns.
7. **Documentation** — Created WEBHOOK_FIELD_REFERENCE.md for automation engineer mapping.

---

## 3. Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React + Vite + Tailwind CSS + Shadcn UI        │
│  Wouter (routing) + TanStack Query (data)       │
│  Port: served via Express (same port 5000)      │
└─────────────────┬───────────────────────────────┘
                  │ API calls (/api/*)
┌─────────────────▼───────────────────────────────┐
│                   BACKEND                        │
│  Express.js + express-session (connect-pg-simple)│
│  bcryptjs (password hashing)                     │
│  Nodemailer (email)                              │
│  Port: 5000                                      │
└──────┬──────────┬──────────┬────────────────────┘
       │          │          │
┌──────▼───┐ ┌───▼────┐ ┌───▼──────────────┐
│PostgreSQL│ │Object  │ │External Webhook  │
│(Drizzle  │ │Storage │ │(n8n/automation)  │
│ORM)      │ │(Replit)│ │                  │
└──────────┘ └────────┘ └──────────────────┘
```

**Stack:**
- **Frontend:** React 18, Vite, Tailwind CSS, Shadcn UI components, Wouter (routing), TanStack Query v5
- **Backend:** Express.js, express-session with connect-pg-simple (PostgreSQL session store)
- **Database:** PostgreSQL via Drizzle ORM
- **Auth:** bcryptjs for password hashing, 6-digit OTP via email, session-based authentication
- **File Storage:** Replit Object Storage (presigned URL uploads)
- **Email:** Nodemailer (SMTP configuration via env vars)
- **Webhook:** Native fetch with HMAC-SHA256 signature

---

## 4. Complete File Structure

```
global-visas/
├── attached_assets/               # Logo and uploaded screenshots
│   └── GLOBAL-VISA-logo_*.webp    # Brand logo
├── client/
│   └── src/
│       ├── App.tsx                 # Main app with routing (public/protected/admin routes)
│       ├── index.css               # Global styles, Tailwind config, brand colors
│       ├── main.tsx                # React entry point
│       ├── components/
│       │   └── ui/                 # Shadcn UI components (button, card, dialog, etc.)
│       ├── hooks/
│       │   └── use-toast.ts        # Toast notification hook
│       ├── lib/
│       │   ├── auth.tsx            # AuthProvider context + useAuth hook
│       │   ├── queryClient.ts      # TanStack Query client + apiRequest helper
│       │   └── utils.ts            # Utility functions (cn class merge)
│       └── pages/
│           ├── login.tsx           # Applicant login page with OTP
│           ├── signup.tsx          # Signup page with email verification
│           ├── dashboard.tsx       # Applicant dashboard (my applications)
│           ├── application.tsx     # Form wizard (Steps 1-22)
│           ├── application-view.tsx # View submitted application status
│           ├── admin.tsx           # Admin dashboard (manage all applications)
│           ├── admin-application.tsx # Admin per-application detail view
│           └── admin-login.tsx     # Admin login portal
├── server/
│   ├── index.ts                   # Express server entry point
│   ├── routes.ts                  # All API routes + webhook logic
│   ├── storage.ts                 # IStorage interface + DatabaseStorage implementation
│   ├── db.ts                      # Database connection (Drizzle + PostgreSQL)
│   ├── email.ts                   # Email notification system (OTP, status updates)
│   ├── vite.ts                    # Vite dev server integration
│   └── replit_integrations/
│       └── object_storage/        # Replit Object Storage integration
│           ├── objectStorage.ts   # Storage client
│           └── routes.ts          # Upload/serve routes
├── shared/
│   └── schema.ts                  # Database schema (users, otpCodes, applications, documents)
├── script/
│   └── seed-admin.ts              # Admin user seeder script
├── WEBHOOK_FIELD_REFERENCE.md     # Complete webhook field reference for automation
├── PROJECT_HANDOVER.md            # This document
├── replit.md                      # Project memory/context file
├── package.json                   # Dependencies and scripts
├── drizzle.config.ts              # Drizzle ORM configuration
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite build configuration
└── postcss.config.js              # PostCSS configuration
```

---

## 5. Database Schema

### Users Table
```
users
├── id            VARCHAR   (PK, UUID auto-generated)
├── email         TEXT      (unique, not null)
├── firstName     TEXT      (not null) — DB column: first_name
├── lastName      TEXT      (not null) — DB column: last_name
├── password      TEXT      (not null, bcrypt hashed)
├── role          TEXT      (not null, default: "applicant") — "applicant" or "admin"
├── emailVerified BOOLEAN   (not null, default: false) — DB column: email_verified
└── createdAt     TIMESTAMP (not null, auto) — DB column: created_at
```

### OTP Codes Table
```
otpCodes
├── id        VARCHAR   (PK, UUID auto-generated)
├── email     TEXT      (not null)
├── code      TEXT      (not null, 6-digit)
├── expiresAt TIMESTAMP (not null) — DB column: expires_at
└── used      BOOLEAN   (not null, default: false)
```

### Applications Table
```
applications
├── id          VARCHAR   (PK, UUID auto-generated)
├── trn         TEXT      (unique, not null) — Transaction Reference Number
├── userId      VARCHAR   (FK → users.id, not null) — DB column: user_id
├── status      TEXT      (not null, default: "draft") — draft/submitted/in_review/approved/rejected
├── currentStep INTEGER   (not null, default: 1) — DB column: current_step
├── formData    JSONB     (not null, default: {}) — All form fields stored as JSON
├── adminNotes  TEXT      (nullable) — DB column: admin_notes
├── submittedAt TIMESTAMP (nullable) — DB column: submitted_at
├── createdAt   TIMESTAMP (not null, auto) — DB column: created_at
└── updatedAt   TIMESTAMP (not null, auto) — DB column: updated_at
```

### Documents Table
```
documents
├── id          VARCHAR   (PK, UUID auto-generated)
├── applicationId VARCHAR (FK → applications.id, not null) — DB column: application_id
├── category    TEXT      (not null) — travel_document, national_id, previous_travel, family_register, tourism_evidence, financial_evidence
├── fileName    TEXT      (not null) — DB column: file_name
├── fileUrl     TEXT      (not null) — DB column: file_url
├── fileSize    INTEGER   (nullable) — DB column: file_size
├── mimeType    TEXT      (nullable) — DB column: mime_type
├── uploadedBy  VARCHAR   (FK → users.id, not null) — DB column: uploaded_by
└── createdAt   TIMESTAMP (not null, auto) — DB column: created_at
```

---

## 6. All 22 Form Steps (Detailed)

### Step 1: Terms and Conditions
- Links to Terms and Conditions and Privacy Statement
- **Fields:**
  - `termsAccepted` — Checkbox (Yes/No)

### Step 2: Application Context
- **Fields:**
  - `outsideAustralia` — Radio (Yes/No): Is the applicant currently outside Australia?
  - `currentLocation` — Country dropdown (if outside Australia)
  - `legalStatus` — Dropdown: Citizen, Permanent Resident, etc.
  - `visaStream` — Radio: tourist, business, sponsored_family, frequent_traveller, approved_destination_status
  - `visitReasons` — Multi-select tags: Tourism, Business, Visit family, etc.
  - `groupProcessing` — Always "No" (disabled)
  - `specialCategory` — Radio (Yes/No)
  - `specialCategoryType` — Radio (if Yes): foreign_government, united_nations, exempt_group
  - `significantDates` — Free text
  - `lengthOfStay` — Dropdown: Up to 3 months, Up to 6 months, Up to 12 months
  - `departmentOffice` — Dropdown: Closest Australian Government Office
  - **If outside Australia = No (further stay):**
    - `furtherStayLength` — Dropdown
    - `furtherStayEndDate` — Date
    - `furtherStayReason` — Textarea

### Step 3: Applicant Details
- **Basic Fields:**
  - `familyName` — Text
  - `givenNames` — Text
  - `sex` — Radio: male, female, other
  - `dateOfBirth` — Date
  - `birthTownCity` — Text
  - `birthStateProvince` — Text
  - `birthCountry` — Country dropdown
  - `relationshipStatus` — Dropdown: Married, De Facto, Never Married, Widowed, Divorced, Separated
  - `hasOtherNames` — Radio (Yes/No)
  - `citizenOfOtherCountry` — Radio (Yes/No)
  - `hasNationalIdCard` — Radio (Yes/No)
  - `isPacificAustraliaCardHolder` — Radio (Yes/No)
  - `pacificAustraliaCardNumber` — Text (if Yes)
  - `hasGrantNumber` — Radio (Yes/No)
  - `grantNumber` — Text (if Yes)
  - `hasOtherPassports` — Radio (Yes/No)
  - `hasOtherIdentityDocs` — Radio (Yes/No)
  - `hasHealthExamination` — Radio (Yes/No)
  - `healthExaminationDetails` — Textarea (if Yes)
  - `hapId` — Text (if Yes)

- **Expandable Table: Other Names** (when hasOtherNames = Yes)
  - `otherNames` — Array of objects, each with:
    - `familyName` — Text
    - `givenNames` — Text
    - `reason` — Text (reason for name change)

- **Expandable Table: Other Citizenships** (when citizenOfOtherCountry = Yes)
  - `otherCitizenships` — Array of country name strings

- **Expandable Table: National ID Cards** (when hasNationalIdCard = Yes)
  - `nationalIdCards` — Array of objects, each with:
    - `familyName` — Text
    - `givenNames` — Text
    - `idNumber` — Text
    - `country` — Country
    - `issueDate` — Date
    - `expiryDate` — Date

- **Expandable Table: Other Travel Documents** (when hasOtherPassports = Yes)
  - `otherTravelDocs` — Array of objects, each with:
    - `docType` — Text (Immicard, Titre de voyage, etc.)
    - `name` — Text
    - `docNumber` — Text
    - `country` — Country
    - `nationality` — Text
    - `dob` — Date
    - `sex` — Text
    - `expiry` — Date
    - `placeOfIssue` — Text
    - `issueDate` — Date

- **Expandable Table: Other Identity Documents** (when hasOtherIdentityDocs = Yes)
  - `otherIdentityDocs` — Array of objects, each with:
    - `familyName` — Text
    - `givenNames` — Text
    - `docType` — Text (Birth certificate, Driver's licence, etc.)
    - `idNumber` — Text
    - `country` — Country

### Step 4: Passport Details
- **Fields:**
  - `countryOfPassport` — Country dropdown
  - `citizenOfPassportCountry` — Radio (Yes/No)
  - `nationalityOfHolder` — Country dropdown
  - `passportNumber` — Text
  - `dateOfIssue` — Date
  - `dateOfExpiry` — Date
  - `placeOfIssue` — Text

### Step 5: Travelling Companions
- **Fields:**
  - `hasTravellingCompanions` — Radio (Yes/No)

- **Expandable Table** (when Yes):
  - `travellingCompanions` — Array of objects, each with:
    - `relationship` — Text
    - `familyName` — Text
    - `givenNames` — Text
    - `sex` — Text
    - `dob` — Date

### Step 6: Contact Details
- **Fields:**
  - `usualCountryOfResidence` — Country dropdown
  - `emailAddress` — Email
  - `homePhone` — Text
  - `businessPhone` — Text
  - `mobilePhone` — Text
  - `residentialAddress1` — Text
  - `residentialAddress2` — Text
  - `residentialSuburb` — Text
  - `residentialState` — Text
  - `residentialPostalCode` — Text
  - `residentialCountry` — Country dropdown
  - `postalSameAsResidential` — Radio (Yes/No)
  - **If postal different:**
    - `postalAddress1`, `postalAddress2`, `postalSuburb`, `postalState`, `postalPostalCode`, `postalCountry`

### Step 7: Authorised Recipient
- **Fields:**
  - `authorisedRecipient` — Radio: No, Registered Migration Agent, Legal Practitioner, Another Person
  - **If agent/legal/person selected:**
    - `recipientMARN` or `recipientLPN` — Text
    - `recipientFamilyName`, `recipientGivenNames` — Text
    - `recipientOrganisation` — Text
    - `recipientAddress`, `recipientPhone` — Text

### Step 8: Non-Accompanying Family Members
- **Fields:**
  - `hasNonAccompanyingMembers` — Radio (Yes/No)

- **Expandable Table** (when Yes):
  - `nonAccompanyingMembers` — Array of objects, each with:
    - `relationship` — Text
    - `familyName` — Text
    - `givenNames` — Text
    - `sex` — Text
    - `dob` — Date
    - `countryOfBirth` — Country

### Step 9: Entry to Australia
- **Fields:**
  - `plannedArrivalDate` — Date
  - `plannedDepartureDate` — Date
  - `lengthOfStay` — Dropdown
  - `multipleEntry` — Radio (Yes/No)
  - `willStudy` — Radio (Yes/No)
  - `hasAustraliaContacts` — Radio (Yes/No)

- **Expandable Table: Entry Dates** (when multipleEntry = Yes and knows dates):
  - `entryDates` — Array of objects: `reason`, `dateFrom`, `dateTo`

- **Expandable Table: Study Courses** (when willStudy = Yes):
  - `studyCourses` — Array of objects: `courseName`, `institution`, `dateFrom`, `dateTo`

- **Expandable Table: Australia Contacts** (when hasAustraliaContacts = Yes):
  - `australiaContacts` — Array of objects: `relationship`, `familyName`, `givenNames`, `sex`, `dob`, `country`, `address1`, `address2`, `suburb`, `state`, `postcode`, `homePhone`, `businessPhone`, `mobilePhone`, `email`, `residencyStatus`

### Step 10: Previous Travel to Australia
- **STATUS: NOT IMPLEMENTED** — Shows "Development is in process"
- **Expected Fields:**
  - `previouslyTravelledToAustralia` — Radio (Yes/No)
  - `previouslyAppliedForVisa` — Radio (Yes/No)
  - Previous visa details

### Step 11: Employment Details
- **Fields:**
  - `employmentStatus` — Dropdown: Employed, Unemployed, Student, Retired, Home Duties
  - **If Employed:**
    - `empOrganisation` — Text
    - `empOccupationGrouping` — Dropdown
    - `empStartDate` — Date
    - `empOrgAddress1`, `empOrgSuburb`, `empOrgState`, `empOrgPostalCode`, `empOrgCountry` — Address fields
    - `empContactFamilyName`, `empContactGivenNames` — Text
    - `empContactBusinessPhone` — Text
    - `empContactEmail` — Email

### Step 12: Financial Support
- **Fields:**
  - `fundingSource` — Radio: Self funded, Employer, Other organisation, Other person
  - `selfFundedDetails` — Textarea (if Self funded)

### Step 13: Additional Details
- **STATUS: NOT IMPLEMENTED** — Shows "Development is in process"

### Step 14: Critical Data Confirmation
- **Fields:**
  - Displays summary of key data: Name, Sex, DOB, Country of Birth, Passport Number, Country of Passport
  - `criticalDataConfirmed` — Radio (Yes/No): Is the above information correct?

### Step 15: Visit Relatives
- **STATUS: NOT IMPLEMENTED** — Shows "Development is in process"
- **Expected Fields:**
  - `visitRelatives` — Array of relative details

### Step 16: Health Declarations
- **Toggle Fields (each Yes/No):**
  - `healthVisitedOutside` — Visited/lived outside country of passport for 3+ months?
  - `healthEnterHospital` — Intend to enter a hospital or health care facility?
  - `healthWorkHealthcare` — Intend to work/study as a doctor, dentist, nurse?
  - `healthAgedCare` — Intend to work/study in aged care or disability care?
  - `healthTuberculosis` — Ever had or currently have tuberculosis?
  - `healthMedicalCosts` — Expect to incur medical costs or require treatment?
  - `healthOngoingCare` — Require ongoing health or community care?

- **Expandable Tables (when respective toggle = Yes):**
  - `healthVisitedCountries` — Array: `name`, `country`, `dateFrom`, `dateTo`
  - `healthHospitalEntries` — Array: `name`, `reason`, `details`
  - `healthWorkHealthcareEntries` — Array: `name`, `role`, `details`
  - `healthAgedCareEntries` — Array: `name`, `role`, `details`
  - `healthTbEntries` — Array: `name`, `details`
  - `healthMedicalCostEntries` — Array: `name`, `condition`, `details`
  - `healthOngoingCareEntries` — Array: `name`, `details`

### Step 17: Character Declarations
- **Toggle Fields (each Yes/No):**
  - `charConvicted` — Convicted of an offence?
  - `charOffenceCharged` — Currently charged with an offence?
  - `charAcquittedInsanity` — Acquitted on grounds of unsoundness of mind?
  - `charArrestWarrant` — Subject to an arrest warrant?
  - `charWarCrimes` — Involved in war crimes or crimes against humanity?
  - `charDomesticViolence` — Subject to domestic violence order?
  - `charSexualOffence` — Convicted of sexual offence?
  - `charSexOffenderRegister` — Listed on sex offender register?
  - `charDeported` — Ever deported, excluded, or removed?
  - `charVisaOverstay` — Overstayed a visa in any country?
  - `charCriminalConduct` — Involved in people trafficking or smuggling?
  - `charPeopleSmuggling` — Involved in people smuggling?
  - `charViolenceOrg` — Associated with violent organisation?
  - `charNationalSecurity` — Threat to national security?
  - `charOutstandingDebts` — Outstanding debts to Australian Government?
  - `charMilitaryService` — Served in military/state/intelligence?
  - `charMilitaryTraining` — Received military/intelligence training?
  - `charUnfitPlead` — Found unfit to plead?

- **Expandable Tables (when respective toggle = Yes):**
  - `charOffenceEntries` — Array: `name`, `offenceType`, `date`, `description`
  - `charConvictedEntries` — Array: `name`, `offenceType`, `date`, `description`
  - `charDvoEntries` — Array: `name`, `date`, `details`
  - `charMilitaryEntries` — Array: `name`, `country`, `dateFrom`, `dateTo`, `details`
  - `charTrainingEntries` — Array: `name`, `country`, `dateFrom`, `dateTo`, `details`

### Step 18: Visa History
- **Fields:**
  - `visaHeldVisa` — Radio (Yes/No): Previously held an Australian visa?
  - `visaNonComplied` — Radio (Yes/No): Non-complied with visa conditions?
  - `visaRefusedCancelled` — Radio (Yes/No): Visa refused or cancelled?

### Step 19: Additional Declarations
- **STATUS: NOT IMPLEMENTED** — Shows "Development is in process"

### Step 20: Declarations
- **Fields (all Yes/No):**
  - `declNoWork` — Will not work unlawfully
  - `declNoStudyTraining` — Will not study/train beyond visa conditions
  - `declLeaveAustralia` — Will leave Australia before visa expires
  - `declNoFurtherStay` — Understands "No Further Stay" condition may apply
  - `declInformChanges` — Will inform of any changes in circumstances
  - `declCompleteCorrect` — Information is complete and correct
  - `declReadUnderstood` — Read and understood all questions
  - `declFraudulentRefusal` — Understands fraud may lead to refusal
  - `declFraudulentCancellation` — Understands fraud may lead to cancellation
  - `declUnlawfulNonCitizen` — Understands unlawful non-citizen status
  - `declPersonalInfo` — Authorises collection of personal information
  - `declPrivacyNotice` — Has read the privacy notice
  - `declBiometricConsent` — Consents to biometric collection
  - `declFingerprints` — Consents to fingerprint collection
  - `declFingerprintsLawEnforcement` — Consents to fingerprints for law enforcement
  - `declLawEnforcementConsent` — Consents to law enforcement checks

### Step 21: Review
- Read-only summary of ALL data entered in Steps 1-20
- Displays all fields, tables, and expandable data
- "Submit Application" button

### Step 22: Attach Documents
- **Document Upload Categories:**
  - **Required:**
    - `travel_document` — Travel Document (passport copy)
    - `national_id` — National ID card
    - `previous_travel` — Previous travel evidence
  - **Recommended:**
    - `family_register` — Family register
    - `tourism_evidence` — Tourism evidence
    - `financial_evidence` — Financial evidence
- Upload via presigned URL to Replit Object Storage
- Displays file name, size, and delete option

---

## 7. API Routes Reference

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/signup` | Register new user (hashes password, starts session) |
| POST | `/api/auth/login` | Applicant login (email + password) |
| POST | `/api/auth/admin-login` | Admin login (username or email + password) |
| POST | `/api/auth/verify-otp` | Verify 6-digit OTP code |
| POST | `/api/auth/resend-otp` | Resend OTP to email |
| GET | `/api/auth/me` | Get current authenticated user |
| POST | `/api/auth/logout` | Destroy session |

### Applications (User)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/applications` | List user's applications |
| POST | `/api/applications` | Create new draft application |
| GET | `/api/applications/:id` | Get specific application |
| PATCH | `/api/applications/:id` | Update form data / step |
| POST | `/api/applications/:id/submit` | Submit application (triggers webhook) |

### Admin
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/applications` | List all applications |
| GET | `/api/admin/applications/:id` | Get application with applicant details |
| PATCH | `/api/admin/applications/:id/status` | Update status + notes (sends email) |
| POST | `/api/admin/applications/:id/submit` | Admin force-submit (triggers webhook) |
| GET | `/api/admin/stats` | Dashboard statistics |
| GET | `/api/admin/admins` | List admin users |
| POST | `/api/admin/admins` | Create/promote admin |
| DELETE | `/api/admin/admins/:id` | Demote admin to applicant |

### File Storage
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/uploads/request-url` | Get presigned upload URL |
| GET | `/objects/*` | Serve uploaded files |

---

## 8. Authentication System

### How It Works
1. **Signup:** User provides email, first name, last name, password. Password is hashed with bcryptjs. Session starts immediately. Email is marked as verified on signup.
2. **Login (Applicant):** User enters email + password at `/login`. Admin accounts are blocked from this route.
3. **Login (Admin):** Admin enters username ("admin") or email + password at `/admin/login`. Only admin role accounts can login here.
4. **OTP:** 6-digit codes sent via email (or logged to console if SMTP not configured). Codes expire after a set time.
5. **Sessions:** express-session with connect-pg-simple (stored in PostgreSQL). Session cookie is httpOnly.

### Admin Credentials
- **Username:** `admin`
- **Email:** `shaan.codereve@gmail.com`
- **Password:** `admin`
- Admin password is **auto-reset to "admin" on every server startup** (see `server/routes.ts` startup logic)
- Admin is seeded via `script/seed-admin.ts`

---

## 9. Admin System

### Admin Dashboard (`/admin`)
- View all applications with status filters
- Statistics: total, pending, approved, rejected, draft counts
- Click any application to view details

### Admin Application Detail (`/admin/applications/:id`)
- View all form data submitted by the applicant
- View and manage uploaded documents
- Upload documents on behalf of the applicant
- Update application status (draft, submitted, in_review, approved, rejected)
- Add admin notes
- Submit application on behalf of the applicant

---

## 10. Webhook Integration

### How It Works
When an application is submitted (by user or admin), a POST request is sent to the webhook URL.

### Configuration
- `WEBHOOK_URL` — Default: `https://platform.seogent.io/webhook/immi-visa-application-submission`
- `WEBHOOK_SECRET` — Optional. When set, adds `X-Webhook-Signature` header (HMAC-SHA256)

### Payload Structure
The payload is **completely flat** — all form fields are top-level keys, no nesting.

- **Metadata:** `event`, `timestamp`
- **Application:** `application_id`, `application_status`, `application_current_step`, `application_admin_notes`, `application_submitted_at`, `application_created_at`
- **Applicant:** `applicant_id`, `applicant_email`, `applicant_username`, `applicant_full_name`, `applicant_role`, `applicant_verified`
- **Form Fields:** All form fields as top-level keys (e.g., `familyName`, `givenNames`, `dateOfBirth`, etc.)

### Data Normalization
- Boolean `true`/`false` → `"Yes"` / `"No"` strings
- Arrays of objects → JSON strings with `_count` helper field
- Simple arrays → comma-separated strings
- Full reference: See `WEBHOOK_FIELD_REFERENCE.md`

### Security
- HMAC-SHA256 signature in `X-Webhook-Signature` header (when `WEBHOOK_SECRET` is set)
- 10-second timeout
- Duplicate submit guard (prevents double-firing)

---

## 11. Email System

### Configuration (server/email.ts)
Uses Nodemailer. If SMTP credentials are not set, OTP codes are logged to the server console.

### Email Types
1. **OTP Verification** — Sends 6-digit code for email verification
2. **Status Update** — Notifies applicant when admin changes their application status
3. **Admin Alerts** — (Optional) Notifies admin of new submissions

---

## 12. Document Upload System

### Categories
| Category | Type | Key |
|----------|------|-----|
| Travel Document | Required | `travel_document` |
| National ID | Required | `national_id` |
| Previous Travel | Required | `previous_travel` |
| Family Register | Recommended | `family_register` |
| Tourism Evidence | Recommended | `tourism_evidence` |
| Financial Evidence | Recommended | `financial_evidence` |

### How It Works
1. Frontend requests a presigned upload URL from `/api/uploads/request-url`
2. File is uploaded directly to Replit Object Storage
3. Document metadata (filename, URL, size, category) is saved to the `documents` table
4. Both applicants and admins can upload documents

---

## 13. Environment Variables

### Required for Full Functionality
| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `SESSION_SECRET` | Session encryption secret | Auto-generated fallback exists |
| `SMTP_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | SMTP username/email | `noreply@globalvisas.com` |
| `SMTP_PASS` | SMTP password | `your-app-password` |
| `SMTP_FROM` | From email address | Defaults to SMTP_USER |

### Optional
| Variable | Purpose | Default |
|----------|---------|---------|
| `WEBHOOK_URL` | Webhook endpoint | `https://platform.seogent.io/webhook/immi-visa-application-submission` |
| `WEBHOOK_SECRET` | HMAC signing secret | Not set (no signature) |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |

### Replit-Specific (Auto-configured)
| Variable | Purpose |
|----------|---------|
| `PUBLIC_OBJECT_SEARCH_PATHS` | Object Storage public paths |
| `PRIVATE_OBJECT_DIR` | Object Storage private directory |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Storage bucket ID |

---

## 14. Setting Up on a New Replit Account

### Step-by-Step Instructions

1. **Create a new Replit project**
   - Choose "Import from GitHub"
   - Enter: `https://github.com/shaancodereve-a11y/global-visas.git`
   - Language: Node.js

2. **Set up PostgreSQL Database**
   - In Replit, go to the "Database" tab (or Tools → Database)
   - Create a new PostgreSQL database
   - The `DATABASE_URL` will be automatically set

3. **Set up Object Storage**
   - In Replit, go to Tools → Object Storage
   - Create a new bucket
   - Environment variables (`PUBLIC_OBJECT_SEARCH_PATHS`, `PRIVATE_OBJECT_DIR`, `DEFAULT_OBJECT_STORAGE_BUCKET_ID`) will be auto-set

4. **Set Environment Variables**
   - Go to Secrets (lock icon in sidebar)
   - Add `SESSION_SECRET` — any random string (e.g., `my-super-secret-key-12345`)
   - Add SMTP variables if you want email to work (optional for development)
   - Add `WEBHOOK_URL` and `WEBHOOK_SECRET` if needed

5. **Install Dependencies**
   - Run: `npm install`

6. **Push Database Schema**
   - Run: `npm run db:push`

7. **Seed Admin User**
   - Run: `npx tsx script/seed-admin.ts`
   - This creates the admin user (admin / admin)

8. **Start the Application**
   - Run: `npm run dev`
   - The app starts on port 5000
   - Admin login: `/admin/login` (username: admin, password: admin)
   - User login: `/login`

9. **Configure Workflow**
   - In Replit, set up a workflow named "Start application" with command: `npm run dev`

### Important Notes
- The admin password resets to "admin" on every server restart
- OTP codes are logged to the server console when SMTP is not configured
- The app serves both frontend and backend on the same port (5000)

---

## 15. Deploying to Hostinger VPS (dev88.space)

### Current Setup
- Hostinger VPS hosts WordPress (port 80/443) and the Node.js app (port 5000)
- Nginx proxies both services

### Deployment Steps
1. SSH into the VPS
2. Clone the repo: `git clone https://github.com/shaancodereve-a11y/global-visas.git`
3. Install dependencies: `npm install`
4. Set environment variables (DATABASE_URL, SESSION_SECRET, SMTP vars, etc.)
5. Build: `npm run build`
6. Start with PM2: `pm2 start npm --name "global-visas" -- start`
7. Configure Nginx to proxy port 5000

### Nginx Config Example
```nginx
server {
    listen 80;
    server_name dev88.space;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 16. Pending / Incomplete Items

### Steps Not Yet Implemented
These steps currently show "Development is in process" on the form:

| Step | Expected Content | Priority |
|------|-----------------|----------|
| **Step 10** | Previous Travel to Australia — details of prior visits, visa history | High |
| **Step 13** | Additional Details — extra applicant information | Medium |
| **Step 14** | (Note: Step 14 Critical Data Confirmation IS implemented; numbering may vary) | — |
| **Step 15** | Visit Relatives — details of relatives being visited | Medium |
| **Step 19** | Additional Declarations — extra declaration items | Medium |

### Other Pending Items
- **SMTP Configuration:** Email credentials not yet provided. OTP codes currently log to server console.
- **Automation Engineer Requests:** The automation engineer may need specific form fields completed/tested to finish their n8n workflow mapping. Coordinate with them using `WEBHOOK_FIELD_REFERENCE.md`.
- **Form Validation:** Some steps may need stricter validation rules.
- **Mobile Optimization:** Further testing on various device sizes.

---

## 17. For the Automation Engineer

### Key Resources
1. **WEBHOOK_FIELD_REFERENCE.md** — Complete field-by-field reference with examples and data types
2. **Webhook URL:** `https://platform.seogent.io/webhook/immi-visa-application-submission` (configurable via `WEBHOOK_URL` env var)

### Important Notes
- All Yes/No fields are normalized to `"Yes"` / `"No"` strings (never boolean true/false)
- Expandable table data (otherNames, travellingCompanions, etc.) is sent as **JSON strings** — parse with `JSON.parse()` in your automation
- A `_count` field is included alongside each array field (e.g., `travellingCompanions_count: 2`)
- Simple arrays (like `otherCitizenships`) are comma-separated strings
- Conditional fields only appear when their parent toggle is "Yes"
- The webhook fires on both user submit and admin submit
- HMAC-SHA256 signature is in the `X-Webhook-Signature` header when `WEBHOOK_SECRET` is configured
- Full payload is logged to server console for debugging

### Testing
To test the webhook:
1. Create a new user account at `/signup`
2. Start a new application from the dashboard
3. Fill out all 22 steps
4. Submit the application
5. The webhook fires immediately on submit

---

## 18. Brand & Design

- **Primary Color:** #02ACE2 (light blue)
- **Secondary Color:** #0C51AC (dark blue)
- **Logo:** `attached_assets/GLOBAL-VISA-logo_1771013259487.webp`
- **Font:** Inter
- **Design:** Clean, modern — not a copy of immi.gov.au but inspired by it

---

## 19. Troubleshooting

### Common Issues

**App won't start:**
- Check `DATABASE_URL` is set correctly
- Run `npm run db:push` to sync the database schema
- Check for port conflicts (port 5000)

**Login not working:**
- Admin: Use `/admin/login` with username "admin" and password "admin"
- Applicant: Use `/login` with email and password
- Admin accounts cannot login via `/login` (and vice versa)

**OTP not received:**
- Check if SMTP variables are configured
- If not configured, check the server console — OTP codes are logged there

**Documents not uploading:**
- Ensure Object Storage is set up in Replit
- Check that `PRIVATE_OBJECT_DIR` and `PUBLIC_OBJECT_SEARCH_PATHS` are set

**Webhook not firing:**
- Check `WEBHOOK_URL` is set correctly
- Check server console for "Webhook sent:" or "Webhook delivery failed:" messages
- Ensure the application is being submitted (not just saved as draft)

**Database errors:**
- Run `npm run db:push` to sync schema
- If that fails, try `npm run db:push --force`

---

## Summary

This project is a fully functional visa application management system with 22 form steps, admin dashboard, email notifications, and webhook integration. The code is on GitHub and can be cloned to any new Replit account by following the setup instructions in Section 14. The pending items (Steps 10, 13, 15, 19) are the main development work remaining.

**GitHub:** https://github.com/shaancodereve-a11y/global-visas.git
**Live:** https://dev88.space
**Admin:** username `admin`, password `admin`
