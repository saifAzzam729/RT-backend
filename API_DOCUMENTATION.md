# RT Backend API Documentation

**Base URL:** `/api` (all endpoints are prefixed with `/api`)

**Authentication:** Most endpoints require a Bearer token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [General/App](#generalapp)
3. [Jobs](#jobs)
4. [Tenders](#tenders)
5. [Applications](#applications)
6. [Companies](#companies)
7. [Organizations](#organizations)
8. [Profiles](#profiles)
9. [Users](#users)
10. [Reports](#reports)
11. [Pricing](#pricing)
12. [Storage/Upload](#storageupload)
13. [Content Management](#content-management)
14. [Admin](#admin)

---

## Authentication

### POST `/api/auth/signup`
Register a new user

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "uuid",
  "email": "user@example.com"
}
```

---

### POST `/api/auth/login`
Login user

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```
OR
```json
{
  "phone": "+1234567890",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "email_verified": true
  }
}
```

---

### POST `/api/auth/verify-email`
Verify email with OTP

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### POST `/api/auth/resend-verification`
Resend verification code

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent successfully"
}
```

---

### POST `/api/auth/refresh`
Refresh access token

**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## General/App

### GET `/api/`
Health check endpoint

**Auth Required:** ❌ Public

**Response (200):**
```json
"Hello World!"
```

---

### GET `/api/stats`
Get homepage statistics

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "activeJobs": 150,
  "activeTenders": 75,
  "registeredUsers": 5000,
  "companies": 200,
  "organizations": 150
}
```

---

### GET `/api/search?q={query}`
Search across jobs and tenders

**Auth Required:** ❌ Public

**Query Parameters:**
- `q` (required): Search query string

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "...",
      "company": { "name": "Acme Corp" }
    }
  ],
  "tenders": [
    {
      "id": "uuid",
      "title": "Construction Project",
      "description": "...",
      "organization": { "name": "ABC Construction" }
    }
  ]
}
```

---

## Jobs

### POST `/api/jobs`
Create a new job posting

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "company_id": "clx1234567890",
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced software engineer...",
  "requirements": "5+ years of experience, knowledge of TypeScript...",
  "salary_min": 50000,
  "salary_max": 100000,
  "employment_type": "Full-time",
  "experience_level": "Senior",
  "status": "open",
  "location": "New York, NY",
  "category": "Technology"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "company_id": "clx1234567890",
  "title": "Senior Software Engineer",
  "description": "...",
  "status": "open",
  "created_at": "2024-01-01T00:00:00Z",
  "company": {
    "id": "clx1234567890",
    "name": "Acme Corporation"
  }
}
```

---

### GET `/api/jobs`
Get all jobs

**Auth Required:** ❌ Public

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (open, closed, etc.)
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `search` (optional): Search query

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "description": "...",
      "status": "open",
      "company": { "name": "Acme Corp" }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### GET `/api/jobs/:id`
Get a job by ID

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Senior Software Engineer",
  "description": "...",
  "requirements": "...",
  "salary_min": 50000,
  "salary_max": 100000,
  "status": "open",
  "company": {
    "id": "uuid",
    "name": "Acme Corporation",
    "logo_url": "https://..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/jobs/company/:companyId`
Get jobs by company

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Senior Software Engineer",
    "status": "open",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### PATCH `/api/jobs/:id`
Update a job

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "title": "Updated Job Title",
  "description": "Updated description...",
  "status": "closed"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Job Title",
  "description": "Updated description...",
  "status": "closed"
}
```

---

### DELETE `/api/jobs/:id`
Delete a job

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

---

## Tenders

### POST `/api/tenders`
Create a new tender

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "organization_id": "clx1234567890",
  "title": "Construction Project Tender",
  "description": "We are seeking contractors for a construction project...",
  "requirements": "Must have 5+ years of experience, valid license...",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "open",
  "location": "New York, NY",
  "category": "Construction"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "organization_id": "clx1234567890",
  "title": "Construction Project Tender",
  "description": "...",
  "status": "open",
  "created_at": "2024-01-01T00:00:00Z",
  "organization": {
    "id": "clx1234567890",
    "name": "ABC Construction Ltd"
  }
}
```

---

### GET `/api/tenders`
Get all tenders

**Auth Required:** ❌ Public

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `search` (optional): Search query

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Construction Project Tender",
      "description": "...",
      "status": "open",
      "organization": { "name": "ABC Construction" }
    }
  ],
  "total": 75,
  "page": 1,
  "limit": 20
}
```

---

### GET `/api/tenders/:id`
Get a tender by ID

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Construction Project Tender",
  "description": "...",
  "requirements": "...",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "open",
  "organization": {
    "id": "uuid",
    "name": "ABC Construction Ltd",
    "logo_url": "https://..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/tenders/organization/:organizationId`
Get tenders by organization

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "title": "Construction Project Tender",
    "status": "open",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### PATCH `/api/tenders/:id`
Update a tender

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "title": "Updated Tender Title",
  "description": "Updated description...",
  "status": "closed"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Updated Tender Title",
  "description": "Updated description...",
  "status": "closed"
}
```

---

### DELETE `/api/tenders/:id`
Delete a tender

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Tender deleted successfully"
}
```

---

## Applications

### GET `/api/applications`
Get all applications

**Auth Required:** ✅ Required

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `jobId` (optional): Filter by job ID
- `tenderId` (optional): Filter by tender ID
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "job_id": "uuid",
      "status": "pending",
      "cover_letter": "...",
      "resume_url": "https://...",
      "created_at": "2024-01-01T00:00:00Z",
      "job": {
        "id": "uuid",
        "title": "Software Engineer"
      },
      "user": {
        "id": "uuid",
        "full_name": "John Doe"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

---

### GET `/api/applications/:id`
Get application by ID

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "job_id": "uuid",
  "status": "pending",
  "cover_letter": "...",
  "resume_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z",
  "job": {
    "id": "uuid",
    "title": "Software Engineer",
    "company": { "name": "Acme Corp" }
  },
  "user": {
    "id": "uuid",
    "full_name": "John Doe",
    "email": "user@example.com"
  }
}
```

---

### DELETE `/api/applications/:id`
Delete application

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Application deleted successfully"
}
```

---

### POST `/api/applications/jobs/:id/apply`
Apply to a job

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest in this position...",
  "resume_url": "https://storage.example.com/resumes/resume.pdf"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "job_id": "uuid",
  "status": "pending",
  "cover_letter": "...",
  "resume_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/applications/jobs/my`
Get my job applications

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "job_id": "uuid",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "job": {
      "id": "uuid",
      "title": "Software Engineer",
      "company": { "name": "Acme Corp" }
    }
  }
]
```

---

### GET `/api/applications/jobs/company/:companyId`
Get job applications for a company

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "job_id": "uuid",
    "status": "pending",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "user@example.com"
    },
    "job": {
      "id": "uuid",
      "title": "Software Engineer"
    }
  }
]
```

---

### PATCH `/api/applications/jobs/:id/status`
Update job application status

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status values:** `pending`, `accepted`, `rejected`, `withdrawn`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "accepted",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### POST `/api/applications/tenders/:id/apply`
Apply to a tender

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest in this tender...",
  "resume_url": "https://storage.example.com/proposals/proposal.pdf"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "tender_id": "uuid",
  "status": "pending",
  "cover_letter": "...",
  "resume_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/applications/tenders/my`
Get my tender applications

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "tender_id": "uuid",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z",
    "tender": {
      "id": "uuid",
      "title": "Construction Project",
      "organization": { "name": "ABC Construction" }
    }
  }
]
```

---

### GET `/api/applications/tenders/organization/:organizationId`
Get tender applications for an organization

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "tender_id": "uuid",
    "status": "pending",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "user@example.com"
    },
    "tender": {
      "id": "uuid",
      "title": "Construction Project"
    }
  }
]
```

---

### PATCH `/api/applications/tenders/:id/status`
Update tender application status

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status values:** `pending`, `accepted`, `rejected`, `withdrawn`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "accepted",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Companies

### GET `/api/companies`
Get all companies

**Auth Required:** ❌ Public

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "description": "A leading technology company...",
    "website": "https://www.acme.com",
    "logo_url": "https://...",
    "location": "San Francisco, CA",
    "industry": "Technology",
    "status": "approved"
  }
]
```

---

### POST `/api/companies`
Create a new company

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "A leading technology company...",
  "website": "https://www.acme.com",
  "logo_url": "https://storage.example.com/logos/acme.png",
  "location": "San Francisco, CA",
  "industry": "Technology",
  "size": "100-500 employees"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "...",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/companies/my`
Get my companies

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "status": "approved",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET `/api/companies/:id`
Get a company by ID

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "A leading technology company...",
  "website": "https://www.acme.com",
  "logo_url": "https://...",
  "location": "San Francisco, CA",
  "industry": "Technology",
  "status": "approved",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/companies/:id/quota`
Get company quota information

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "company_id": "uuid",
  "plan_id": "job-unlimited",
  "plan_name": "Unlimited Jobs",
  "job_quota": {
    "used": 5,
    "limit": -1,
    "unlimited": true
  },
  "tender_quota": {
    "used": 0,
    "limit": 0,
    "unlimited": false
  }
}
```

---

### PATCH `/api/companies/:id`
Update a company

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "Updated Company Name",
  "description": "Updated description...",
  "website": "https://www.updated.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Company Name",
  "description": "Updated description...",
  "website": "https://www.updated.com"
}
```

---

### DELETE `/api/companies/:id`
Delete a company

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Company deleted successfully"
}
```

---

## Organizations

### GET `/api/organizations`
Get all organizations

**Auth Required:** ❌ Public

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "ABC Construction Ltd",
    "description": "A leading construction company...",
    "website": "https://www.abcconstruction.com",
    "logo_url": "https://...",
    "location": "New York, NY",
    "industry": "Construction",
    "status": "approved"
  }
]
```

---

### POST `/api/organizations`
Create a new organization

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "ABC Construction Ltd",
  "description": "A leading construction company...",
  "website": "https://www.abcconstruction.com",
  "logo_url": "https://storage.example.com/logos/abc.png",
  "location": "New York, NY",
  "industry": "Construction",
  "license_number": "LIC-12345",
  "license_file_url": "https://storage.example.com/licenses/license.pdf",
  "work_sectors": ["Construction", "Infrastructure"]
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "ABC Construction Ltd",
  "description": "...",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/organizations/my`
Get my organizations

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "name": "ABC Construction Ltd",
    "status": "approved",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET `/api/organizations/:id`
Get an organization by ID

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "name": "ABC Construction Ltd",
  "description": "A leading construction company...",
  "website": "https://www.abcconstruction.com",
  "logo_url": "https://...",
  "location": "New York, NY",
  "industry": "Construction",
  "license_number": "LIC-12345",
  "work_sectors": ["Construction", "Infrastructure"],
  "status": "approved",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/organizations/:id/quota`
Get organization quota information

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "organization_id": "uuid",
  "plan_id": "tender-unlimited",
  "plan_name": "Unlimited Tenders",
  "job_quota": {
    "used": 0,
    "limit": 0,
    "unlimited": false
  },
  "tender_quota": {
    "used": 3,
    "limit": -1,
    "unlimited": true
  }
}
```

---

### PATCH `/api/organizations/:id`
Update an organization

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "Updated Organization Name",
  "description": "Updated description...",
  "website": "https://www.updated.com"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Updated Organization Name",
  "description": "Updated description...",
  "website": "https://www.updated.com"
}
```

---

### DELETE `/api/organizations/:id`
Delete an organization

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Organization deleted successfully"
}
```

---

### POST `/api/organizations/:id/secondary-accounts`
Invite a secondary account to organization

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (201):**
```json
{
  "message": "Invitation sent successfully",
  "invitation_token": "uuid"
}
```

---

### GET `/api/organizations/:id/secondary-accounts`
Get secondary accounts for an organization

**Auth Required:** ✅ Required

**Response (200):**
```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "organization_id": "uuid",
    "status": "accepted",
    "user": {
      "id": "uuid",
      "full_name": "Jane Doe",
      "email": "jane@example.com"
    }
  }
]
```

---

### POST `/api/organizations/secondary-accounts/accept/:token`
Accept secondary account invitation

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Invitation accepted successfully",
  "organization": {
    "id": "uuid",
    "name": "ABC Construction Ltd"
  }
}
```

---

## Profiles

### GET `/api/profiles/me`
Get my profile

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "bio": "Experienced software engineer...",
  "role": "user",
  "email_verified": true,
  "plan_status": "active",
  "plan_id": "job-single",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PATCH `/api/profiles/me`
Update my profile

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "+1234567890",
  "avatar_url": "https://storage.example.com/avatars/avatar.png",
  "bio": "Updated bio..."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "full_name": "John Updated Doe",
  "phone": "+1234567890",
  "avatar_url": "https://...",
  "bio": "Updated bio..."
}
```

---

### PATCH `/api/profiles/me/plan-status`
Update user plan status

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "plan_status": "active",
  "plan_id": "job-unlimited"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "plan_status": "active",
  "plan_id": "job-unlimited",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Users

### GET `/api/users`
Get all users (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET `/api/users/:id`
Get user by ID

**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT `/api/users/:id`
Update user

**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "avatar_url": "https://..."
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "avatar_url": "https://..."
}
```

---

### DELETE `/api/users/:id`
Delete user (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

## Reports

### POST `/api/reports`
Create a new report

**Auth Required:** ❌ Public (optional user context if authenticated)

**Request Body:**
```json
{
  "report_topic": "Inappropriate Content",
  "listing_type": "job",
  "listing_id": "clx1234567890",
  "listing_url": "https://example.com/jobs/123",
  "details": "This listing contains inappropriate content...",
  "contact_email": "reporter@example.com"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "report_topic": "Inappropriate Content",
  "listing_type": "job",
  "listing_id": "clx1234567890",
  "status": "pending",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### GET `/api/reports`
Get all reports (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
[
  {
    "id": "uuid",
    "report_topic": "Inappropriate Content",
    "listing_type": "job",
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET `/api/reports/notifications`
Get report notifications (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "pending_count": 5,
  "recent_reports": [
    {
      "id": "uuid",
      "report_topic": "Inappropriate Content",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/reports/:id`
Get a report by ID (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "id": "uuid",
  "report_topic": "Inappropriate Content",
  "listing_type": "job",
  "listing_id": "clx1234567890",
  "details": "This listing contains inappropriate content...",
  "status": "pending",
  "contact_email": "reporter@example.com",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PATCH `/api/reports/:id/status`
Update report status (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "status": "resolved"
}
```

**Status values:** `pending`, `reviewing`, `resolved`, `dismissed`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "resolved",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Pricing

### GET `/api/pricing`
Get all pricing plans

**Auth Required:** ❌ Public

**Response (200):**
```json
[
  {
    "plan_id": "job-single",
    "name": "Single Job",
    "description": "Post one job",
    "price": 25,
    "currency": "USD",
    "period": "one-time",
    "plan_type": "job",
    "features": ["Post 1 job", "Unlimited applications", "Standard visibility"],
    "active": true
  },
  {
    "plan_id": "tender-single",
    "name": "Single Tender",
    "description": "Post one tender",
    "price": 50,
    "currency": "USD",
    "period": "one-time",
    "plan_type": "tender",
    "features": ["Post 1 tender", "Unlimited applications", "Standard visibility"],
    "active": true
  }
]
```

---

### GET `/api/pricing/plan/:planId`
Get a specific pricing plan by ID

**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "plan_id": "job-single",
  "name": "Single Job",
  "description": "Post one job",
  "price": 25,
  "currency": "USD",
  "period": "one-time",
  "plan_type": "job",
  "features": ["Post 1 job", "Unlimited applications", "Standard visibility"],
  "active": true
}
```

---

### GET `/api/pricing/calculate?planId={id}&quantity={qty}`
Calculate price for a plan

**Auth Required:** ❌ Public

**Query Parameters:**
- `planId` (required): Pricing plan ID
- `quantity` (optional): Quantity (default: 1)

**Response (200):**
```json
{
  "planId": "job-single",
  "quantity": 2,
  "unitPrice": 25,
  "totalPrice": 50,
  "currency": "USD"
}
```

---

## Storage/Upload

### POST `/api/upload/license`
Upload license file

**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): File to upload (PDF, image, etc.)

**Response (201):**
```json
{
  "message": "License uploaded successfully",
  "url": "https://storage.example.com/licenses/user-id-timestamp.pdf"
}
```

---

### POST `/api/upload/resume`
Upload resume file

**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): File to upload (PDF, DOC, DOCX, etc.)

**Response (201):**
```json
{
  "message": "Resume uploaded successfully",
  "url": "https://storage.example.com/resumes/user-id-timestamp.pdf"
}
```

---

### POST `/api/upload/logo`
Upload logo file

**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): Image file to upload (PNG, JPG, etc.)

**Response (201):**
```json
{
  "message": "Logo uploaded successfully",
  "url": "https://storage.example.com/logos/user-id-timestamp.png"
}
```

---

### POST `/api/upload/avatar`
Upload avatar file

**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): Image file to upload (PNG, JPG, etc.)

**Response (201):**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://storage.example.com/avatars/user-id-timestamp.png"
}
```

**Note:** Static files are served at `/api/storage/{path}`

---

## Content Management

### GET `/api/content`
Get all content

**Auth Required:** ❌ Public

**Query Parameters:**
- `section` (optional): Filter by section (`home`, `footer`, `form`, `general`)
- `language` (optional): Filter by language (`en`, `ar`, default: `en`)

**Response (200):**
```json
[
  {
    "key": "home.hero.title",
    "section": "home",
    "language": "en",
    "value": "Welcome to RT-SYR Platform",
    "type": "text"
  }
]
```

---

### GET `/api/content/:key`
Get content by key

**Auth Required:** ❌ Public

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Response (200):**
```json
{
  "key": "home.hero.title",
  "section": "home",
  "language": "en",
  "value": "Welcome to RT-SYR Platform",
  "type": "text"
}
```

---

### POST `/api/content`
Create content (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "key": "home.hero.title",
  "section": "home",
  "language": "en",
  "value": "Welcome to RT-SYR Platform",
  "type": "text"
}
```

**Response (201):**
```json
{
  "key": "home.hero.title",
  "section": "home",
  "language": "en",
  "value": "Welcome to RT-SYR Platform",
  "type": "text",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PUT `/api/content/:key`
Update content by key (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Request Body:**
```json
{
  "value": "Updated Welcome Message",
  "type": "text"
}
```

**Response (200):**
```json
{
  "key": "home.hero.title",
  "section": "home",
  "language": "en",
  "value": "Updated Welcome Message",
  "type": "text",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### DELETE `/api/content/:key`
Delete content by key (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Response (200):**
```json
{
  "message": "Content deleted successfully"
}
```

---

### GET `/api/content/footer`
Get footer content

**Auth Required:** ❌ Public

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Response (200):**
```json
{
  "description": "RT-SYR Platform for Jobs and Tenders",
  "contactEmail": "contact@rtsyr.com",
  "contactLocation": "Damascus, Syria",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "twitter": "https://twitter.com/example",
    "linkedin": "https://linkedin.com/company/example",
    "instagram": "https://instagram.com/example"
  },
  "platformLinks": [
    { "name": "About Us", "href": "/about" },
    { "name": "Contact", "href": "/contact" }
  ],
  "supportLinks": [
    { "name": "Help Center", "href": "/help" },
    { "name": "FAQ", "href": "/faq" }
  ],
  "copyright": "© 2024 RT-SYR. All rights reserved.",
  "hashtags": {
    "jobs": "#RTJobs",
    "tenders": "#RTTenders"
  }
}
```

---

### PUT `/api/content/footer`
Update footer content (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Request Body:**
```json
{
  "description": "Updated description",
  "contactEmail": "contact@rtsyr.com",
  "contactLocation": "Damascus, Syria",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "twitter": "https://twitter.com/example"
  },
  "platformLinks": [
    { "name": "About Us", "href": "/about" }
  ],
  "supportLinks": [
    { "name": "Help Center", "href": "/help" }
  ],
  "copyright": "© 2024 RT-SYR. All rights reserved.",
  "hashtags": {
    "jobs": "#RTJobs",
    "tenders": "#RTTenders"
  }
}
```

**Response (200):**
```json
{
  "message": "Footer content updated successfully"
}
```

---

### GET `/api/content/form/:formType`
Get form configuration

**Auth Required:** ❌ Public

**Path Parameters:**
- `formType`: Form type (`registration`, `job`, `tender`)

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Response (200):**
```json
{
  "formType": "registration",
  "title": "User Registration",
  "description": "Create your account to get started",
  "submitButtonText": "Sign Up",
  "fields": [
    {
      "id": "email",
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "Enter your email",
      "order": 1,
      "visible": true
    },
    {
      "id": "password",
      "name": "password",
      "label": "Password",
      "type": "password",
      "required": true,
      "placeholder": "Enter your password",
      "validation": {
        "min": 8,
        "pattern": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])"
      },
      "order": 2,
      "visible": true
    }
  ]
}
```

---

### PUT `/api/content/form/:formType`
Update form configuration (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Path Parameters:**
- `formType`: Form type (`registration`, `job`, `tender`)

**Query Parameters:**
- `language` (optional): Content language (`en`, `ar`, default: `en`)

**Request Body:**
```json
{
  "formType": "registration",
  "title": "User Registration",
  "description": "Create your account to get started",
  "submitButtonText": "Sign Up",
  "fields": [
    {
      "id": "email",
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "Enter your email",
      "order": 1,
      "visible": true
    }
  ]
}
```

**Response (200):**
```json
{
  "message": "Form configuration updated successfully"
}
```

---

## Admin

### POST `/api/admin/approve`
Approve or reject an entity (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "entityType": "organization",
  "entityId": "clx1234567890",
  "approved": true
}
```

**Response (200):**
```json
{
  "message": "Entity approval status updated successfully",
  "entity": {
    "id": "clx1234567890",
    "type": "organization",
    "status": "approved"
  }
}
```

---

### GET `/api/admin/pending`
Get pending approvals (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "organizations": [
    {
      "id": "uuid",
      "name": "ABC Construction Ltd",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### GET `/api/admin/analytics`
Get analytics data (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "users": {
    "total": 5000,
    "verified": 4500,
    "new_this_month": 200
  },
  "jobs": {
    "total": 150,
    "active": 120,
    "closed": 30
  },
  "tenders": {
    "total": 75,
    "active": 60,
    "closed": 15
  },
  "companies": {
    "total": 200,
    "approved": 180,
    "pending": 20
  },
  "organizations": {
    "total": 150,
    "approved": 140,
    "pending": 10
  }
}
```

---

### GET `/api/admin/pricing`
Get all pricing plans (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
[
  {
    "plan_id": "job-single",
    "name": "Single Job",
    "description": "Post one job",
    "price": 25,
    "currency": "USD",
    "period": "one-time",
    "plan_type": "job",
    "features": ["Post 1 job"],
    "active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET `/api/admin/pricing/:planId`
Get a specific pricing plan (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "plan_id": "job-single",
  "name": "Single Job",
  "description": "Post one job",
  "price": 25,
  "currency": "USD",
  "period": "one-time",
  "plan_type": "job",
  "features": ["Post 1 job"],
  "active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### POST `/api/admin/pricing`
Create a new pricing plan (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "plan_id": "job-single",
  "name": "Single Job",
  "description": "Post one job",
  "price": 25,
  "currency": "USD",
  "period": "one-time",
  "plan_type": "job",
  "features": ["Post 1 job", "Unlimited applications", "Standard visibility"]
}
```

**Response (201):**
```json
{
  "plan_id": "job-single",
  "name": "Single Job",
  "description": "Post one job",
  "price": 25,
  "currency": "USD",
  "period": "one-time",
  "plan_type": "job",
  "features": ["Post 1 job"],
  "active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PATCH `/api/admin/pricing/:planId`
Update a pricing plan (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "name": "Updated Plan Name",
  "price": 30,
  "features": ["Post 1 job", "Updated feature"]
}
```

**Response (200):**
```json
{
  "plan_id": "job-single",
  "name": "Updated Plan Name",
  "price": 30,
  "features": ["Post 1 job", "Updated feature"],
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### DELETE `/api/admin/pricing/:planId`
Delete a pricing plan (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "message": "Pricing plan deleted successfully"
}
```

---

### GET `/api/admin/users`
Get all users (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by email, name, or phone

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5000,
  "page": 1,
  "limit": 20
}
```

---

### GET `/api/admin/users/:userId`
Get a specific user by ID (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "user",
  "email_verified": true,
  "plan_status": "active",
  "plan_id": "job-single",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### PATCH `/api/admin/users/:userId`
Update a user (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "role": "user"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "updated@example.com",
  "full_name": "Updated Name",
  "phone": "+1234567890",
  "role": "user"
}
```

---

### DELETE `/api/admin/users/:userId`
Delete a user (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "message": "User deleted successfully"
}
```

---

### PATCH `/api/admin/users/:userId/plan`
Update user plan (Admin only)

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "plan_id": "job-unlimited",
  "plan_status": "active"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "plan_id": "job-unlimited",
  "plan_status": "active",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error message"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden - Admin only",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- All UUIDs are in standard UUID format
- File uploads use `multipart/form-data` with field name `file`
- Pagination responses include `total`, `page`, and `limit` fields
- Query parameters are case-sensitive
- The API uses global prefix `/api`
- Swagger documentation is available at `/api/docs` when the server is running

---

## Authentication Flow

1. **Sign Up:** POST `/api/auth/signup` → Receive `userId`
2. **Verify Email:** POST `/api/auth/verify-email` with `userId` and OTP code → Receive `access_token` and `refresh_token`
3. **Login:** POST `/api/auth/login` → Receive `access_token` and `refresh_token`
4. **Use Token:** Include `Authorization: Bearer <access_token>` header in subsequent requests
5. **Refresh Token:** When access token expires, POST `/api/auth/refresh` with `refresh_token` → Receive new tokens

---

**Last Updated:** 2024-01-01

