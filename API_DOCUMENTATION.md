# RT Backend API Documentation

## Table of Contents
- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Authentication](#1-authentication)
  - [Applications](#2-applications)
  - [Jobs](#3-jobs)
  - [Tenders](#4-tenders)
  - [Companies](#5-companies)
  - [Organizations](#6-organizations)
  - [Profiles](#7-profiles)
  - [Reports](#8-reports)
  - [Storage](#9-storage)
  - [Admin](#10-admin)
- [Data Models](#data-models)
- [Enums](#enums)
- [Integration Guide](#integration-guide)

---

## Overview

This is the REST API documentation for the RT Backend application. The API follows RESTful principles and uses JWT (JSON Web Tokens) for authentication.

**API Version:** 1.0  
**Documentation:** Swagger UI available at `/api/docs` when server is running

---

## Base URL

```
Development: http://localhost:{port}/api
Production: {your-production-url}/api
```

All endpoints are prefixed with `/api`.

---

## Authentication

Most endpoints require authentication using JWT Bearer tokens. The authentication flow is:

1. **Sign Up** → User registers with email, password, full name, and role
2. **Verify Email** → User verifies email with OTP code
3. **Login** → User logs in and receives access token and refresh token
4. **Use Token** → Include token in Authorization header for protected endpoints

### Authentication Header Format

```http
Authorization: Bearer {access_token}
```

### Token Refresh

Access tokens expire after a set time. Use the refresh token to get a new access token:

```http
POST /api/auth/refresh
Body: { "refresh_token": "your_refresh_token" }
```

---

## Error Handling

The API uses standard HTTP status codes:

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid authentication token
- `403 Forbidden` - User doesn't have permission (e.g., admin-only endpoints)
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": ["error message 1", "error message 2"],
  "error": "Bad Request"
}
```

---

## API Endpoints

### 1. Authentication

#### 1.1 Sign Up
Register a new user account.

**Endpoint:** `POST /api/auth/signup`  
**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "role": "user"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character (@$!%*?&)

**Response:** `201 Created`
```json
{
  "message": "User registered successfully. Please check your email for OTP.",
  "user_id": "uuid"
}
```

---

#### 1.2 Login
Authenticate user and receive tokens.

**Endpoint:** `POST /api/auth/login`  
**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`
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

#### 1.3 Verify Email
Verify email address with OTP code.

**Endpoint:** `POST /api/auth/verify-email`  
**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "message": "Email verified successfully"
}
```

---

#### 1.4 Resend OTP
Resend OTP code to email.

**Endpoint:** `POST /api/auth/resend-otp`  
**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `200 OK`
```json
{
  "message": "OTP sent successfully"
}
```

---

#### 1.5 Refresh Token
Get new access token using refresh token.

**Endpoint:** `POST /api/auth/refresh`  
**Authentication:** Not required (Public)

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Applications

#### 2.1 Apply to Job
Submit application for a job posting.

**Endpoint:** `POST /api/applications/jobs/:id/apply`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Job ID

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest...",
  "resume_url": "https://storage.example.com/resumes/resume.pdf"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "job_id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "cover_letter": "I am writing to express my interest...",
  "resume_url": "https://storage.example.com/resumes/resume.pdf",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 2.2 Get My Job Applications
Get all job applications submitted by the current user.

**Endpoint:** `GET /api/applications/jobs/my`  
**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "job_id": "uuid",
    "job": {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "company": {
        "name": "Tech Corp"
      }
    },
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 2.3 Get Job Applications for Company
Get all applications for a specific company's jobs.

**Endpoint:** `GET /api/applications/jobs/company/:companyId`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string) - Company ID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "job_id": "uuid",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 2.4 Update Job Application Status
Update the status of a job application.

**Endpoint:** `PATCH /api/applications/jobs/:id/status`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Application ID

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status Values:** `pending`, `reviewed`, `accepted`, `rejected`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "accepted",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

#### 2.5 Apply to Tender
Submit application for a tender.

**Endpoint:** `POST /api/applications/tenders/:id/apply`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Tender ID

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest...",
  "resume_url": "https://storage.example.com/proposals/proposal.pdf"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "tender_id": "uuid",
  "user_id": "uuid",
  "status": "pending",
  "cover_letter": "I am writing to express my interest...",
  "resume_url": "https://storage.example.com/proposals/proposal.pdf",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 2.6 Get My Tender Applications
Get all tender applications submitted by the current user.

**Endpoint:** `GET /api/applications/tenders/my`  
**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "tender_id": "uuid",
    "tender": {
      "id": "uuid",
      "title": "Construction Project Tender",
      "organization": {
        "name": "ABC Construction"
      }
    },
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 2.7 Get Tender Applications for Organization
Get all applications for a specific organization's tenders.

**Endpoint:** `GET /api/applications/tenders/organization/:organizationId`  
**Authentication:** Required

**Path Parameters:**
- `organizationId` (string) - Organization ID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "tender_id": "uuid",
    "user": {
      "id": "uuid",
      "full_name": "John Doe",
      "email": "john@example.com"
    },
    "status": "pending",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 2.8 Update Tender Application Status
Update the status of a tender application.

**Endpoint:** `PATCH /api/applications/tenders/:id/status`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Application ID

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "accepted",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 3. Jobs

#### 3.1 Create Job
Create a new job posting.

**Endpoint:** `POST /api/jobs`  
**Authentication:** Required

**Request Body:**
```json
{
  "company_id": "uuid",
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

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "company_id": "uuid",
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced software engineer...",
  "status": "open",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 3.2 Get All Jobs
Get all job postings (public endpoint).

**Endpoint:** `GET /api/jobs`  
**Authentication:** Not required (Public)

**Query Parameters:**
- `search` (string, optional) - Search query to filter jobs by title or description
- `category` (string, optional) - Filter by job category
- `location` (string, optional) - Filter by job location

**Example:** `GET /api/jobs?search=software&category=Technology&location=New York`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Senior Software Engineer",
    "description": "We are looking for...",
    "company": {
      "id": "uuid",
      "name": "Tech Corp"
    },
    "status": "open",
    "location": "New York, NY",
    "category": "Technology"
  }
]
```

---

#### 3.3 Get Job by ID
Get a specific job by ID (public endpoint).

**Endpoint:** `GET /api/jobs/:id`  
**Authentication:** Not required (Public)

**Path Parameters:**
- `id` (string) - Job ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Senior Software Engineer",
  "description": "We are looking for...",
  "requirements": "5+ years of experience...",
  "salary_min": 50000,
  "salary_max": 100000,
  "employment_type": "Full-time",
  "experience_level": "Senior",
  "status": "open",
  "location": "New York, NY",
  "category": "Technology",
  "company": {
    "id": "uuid",
    "name": "Tech Corp",
    "logo_url": "https://..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 3.4 Get Jobs by Company
Get all jobs posted by a specific company.

**Endpoint:** `GET /api/jobs/company/:companyId`  
**Authentication:** Required

**Path Parameters:**
- `companyId` (string) - Company ID

**Response:** `200 OK`
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

#### 3.5 Update Job
Update a job posting.

**Endpoint:** `PATCH /api/jobs/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Job ID

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Job Title",
  "description": "Updated description...",
  "status": "closed"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Job Title",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

#### 3.6 Delete Job
Delete a job posting.

**Endpoint:** `DELETE /api/jobs/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Job ID

**Response:** `200 OK`
```json
{
  "message": "Job deleted successfully"
}
```

---

### 4. Tenders

#### 4.1 Create Tender
Create a new tender posting.

**Endpoint:** `POST /api/tenders`  
**Authentication:** Required

**Request Body:**
```json
{
  "organization_id": "uuid",
  "title": "Construction Project Tender",
  "description": "We are seeking contractors for a construction project...",
  "requirements": "Must have 5+ years of experience, valid license...",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "open",
  "location": "New York, NY",
  "category": "Construction"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "organization_id": "uuid",
  "title": "Construction Project Tender",
  "status": "open",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 4.2 Get All Tenders
Get all tender postings (public endpoint).

**Endpoint:** `GET /api/tenders`  
**Authentication:** Not required (Public)

**Query Parameters:**
- `search` (string, optional) - Search query to filter tenders by title or description
- `category` (string, optional) - Filter by tender category
- `location` (string, optional) - Filter by tender location

**Example:** `GET /api/tenders?search=construction&category=Construction`

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Construction Project Tender",
    "description": "We are seeking contractors...",
    "organization": {
      "id": "uuid",
      "name": "ABC Construction"
    },
    "status": "open",
    "deadline": "2024-12-31T23:59:59Z",
    "location": "New York, NY"
  }
]
```

---

#### 4.3 Get Tender by ID
Get a specific tender by ID (public endpoint).

**Endpoint:** `GET /api/tenders/:id`  
**Authentication:** Not required (Public)

**Path Parameters:**
- `id` (string) - Tender ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Construction Project Tender",
  "description": "We are seeking contractors...",
  "requirements": "Must have 5+ years...",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "open",
  "location": "New York, NY",
  "category": "Construction",
  "organization": {
    "id": "uuid",
    "name": "ABC Construction",
    "logo_url": "https://..."
  },
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 4.4 Get Tenders by Organization
Get all tenders posted by a specific organization.

**Endpoint:** `GET /api/tenders/organization/:organizationId`  
**Authentication:** Required

**Path Parameters:**
- `organizationId` (string) - Organization ID

**Response:** `200 OK`
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

#### 4.5 Update Tender
Update a tender posting.

**Endpoint:** `PATCH /api/tenders/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Tender ID

**Request Body:** (All fields optional)
```json
{
  "title": "Updated Tender Title",
  "description": "Updated description...",
  "deadline": "2024-12-31T23:59:59Z",
  "status": "closed"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Tender Title",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

#### 4.6 Delete Tender
Delete a tender posting.

**Endpoint:** `DELETE /api/tenders/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Tender ID

**Response:** `200 OK`
```json
{
  "message": "Tender deleted successfully"
}
```

---

### 5. Companies

#### 5.1 Create Company
Create a new company profile.

**Endpoint:** `POST /api/companies`  
**Authentication:** Required

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

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 5.2 Get My Companies
Get all companies owned by the current user.

**Endpoint:** `GET /api/companies/my`  
**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "Acme Corporation",
    "description": "A leading technology company...",
    "website": "https://www.acme.com",
    "logo_url": "https://...",
    "approved": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 5.3 Get Company by ID
Get a specific company by ID.

**Endpoint:** `GET /api/companies/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Company ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "A leading technology company...",
  "website": "https://www.acme.com",
  "logo_url": "https://...",
  "location": "San Francisco, CA",
  "industry": "Technology",
  "size": "100-500 employees",
  "approved": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 5.4 Update Company
Update a company profile.

**Endpoint:** `PATCH /api/companies/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Company ID

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Company Name",
  "description": "Updated description...",
  "website": "https://www.updated.com"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Company Name",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

#### 5.5 Get Company Quota
Get quota information for a company.

**Endpoint:** `GET /api/companies/:id/quota`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Company ID

**Response:** `200 OK`
```json
{
  "company_id": "uuid",
  "jobs_posted": 5,
  "jobs_limit": 10,
  "remaining": 5
}
```

---

### 6. Organizations

#### 6.1 Create Organization
Create a new organization profile.

**Endpoint:** `POST /api/organizations`  
**Authentication:** Required

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

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "ABC Construction Ltd",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 6.2 Get My Organizations
Get all organizations owned by the current user.

**Endpoint:** `GET /api/organizations/my`  
**Authentication:** Required

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "ABC Construction Ltd",
    "description": "A leading construction company...",
    "approved": false,
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 6.3 Get Organization by ID
Get a specific organization by ID.

**Endpoint:** `GET /api/organizations/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Organization ID

**Response:** `200 OK`
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
  "approved": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 6.4 Update Organization
Update an organization profile.

**Endpoint:** `PATCH /api/organizations/:id`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Organization ID

**Request Body:** (All fields optional)
```json
{
  "name": "Updated Organization Name",
  "description": "Updated description...",
  "work_sectors": ["Construction", "Infrastructure", "Renovation"]
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Updated Organization Name",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

#### 6.5 Get Organization Quota
Get quota information for an organization.

**Endpoint:** `GET /api/organizations/:id/quota`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Organization ID

**Response:** `200 OK`
```json
{
  "organization_id": "uuid",
  "tenders_posted": 3,
  "tenders_limit": 10,
  "remaining": 7
}
```

---

#### 6.6 Invite Secondary Account
Invite a user to become a secondary account for an organization.

**Endpoint:** `POST /api/organizations/:id/secondary-accounts`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Organization ID

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:** `201 Created`
```json
{
  "message": "Invitation sent successfully"
}
```

---

#### 6.7 Get Secondary Accounts
Get all secondary accounts for an organization.

**Endpoint:** `GET /api/organizations/:id/secondary-accounts`  
**Authentication:** Required

**Path Parameters:**
- `id` (string) - Organization ID

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe"
    },
    "status": "accepted",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 6.8 Accept Secondary Account Invitation
Accept an invitation to become a secondary account.

**Endpoint:** `POST /api/organizations/secondary-accounts/accept/:token`  
**Authentication:** Required

**Path Parameters:**
- `token` (string) - Invitation token

**Response:** `200 OK`
```json
{
  "message": "Invitation accepted successfully"
}
```

---

### 7. Profiles

#### 7.1 Get My Profile
Get the current user's profile.

**Endpoint:** `GET /api/profiles/me`  
**Authentication:** Required

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "phone": "+1234567890",
  "avatar_url": "https://storage.example.com/avatars/avatar.png",
  "bio": "Experienced software engineer...",
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 7.2 Update My Profile
Update the current user's profile.

**Endpoint:** `PATCH /api/profiles/me`  
**Authentication:** Required

**Request Body:** (All fields optional)
```json
{
  "full_name": "John Updated Doe",
  "phone": "+1234567890",
  "avatar_url": "https://storage.example.com/avatars/new-avatar.png",
  "bio": "Updated bio..."
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "full_name": "John Updated Doe",
  "phone": "+1234567890",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 8. Reports

#### 8.1 Create Report
Create a new report (public endpoint, can be submitted anonymously).

**Endpoint:** `POST /api/reports`  
**Authentication:** Not required (Public, but can include token if logged in)

**Request Body:**
```json
{
  "report_topic": "Inappropriate Content",
  "listing_type": "job",
  "listing_id": "uuid",
  "listing_url": "https://example.com/jobs/123",
  "details": "This listing contains inappropriate content...",
  "contact_email": "reporter@example.com"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "report_topic": "Inappropriate Content",
  "status": "new",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 8.2 Get All Reports
Get all reports (admin only).

**Endpoint:** `GET /api/reports`  
**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "report_topic": "Inappropriate Content",
    "listing_type": "job",
    "status": "new",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 8.3 Get Report Notifications
Get report notifications (admin only).

**Endpoint:** `GET /api/reports/notifications`  
**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "report_id": "uuid",
    "status": "new",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

#### 8.4 Get Report by ID
Get a specific report by ID (admin only).

**Endpoint:** `GET /api/reports/:id`  
**Authentication:** Required (Admin role)

**Path Parameters:**
- `id` (string) - Report ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "report_topic": "Inappropriate Content",
  "listing_type": "job",
  "listing_id": "uuid",
  "listing_url": "https://example.com/jobs/123",
  "details": "This listing contains inappropriate content...",
  "contact_email": "reporter@example.com",
  "status": "new",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

#### 8.5 Update Report Status
Update the status of a report (admin only).

**Endpoint:** `PATCH /api/reports/:id/status`  
**Authentication:** Required (Admin role)

**Path Parameters:**
- `id` (string) - Report ID

**Request Body:**
```json
{
  "status": "resolved"
}
```

**Status Values:** `new`, `in_review`, `resolved`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "status": "resolved",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### 9. Storage

#### 9.1 Upload License
Upload a license file.

**Endpoint:** `POST /api/upload/license`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file) - License file (PDF, image, etc.)

**Response:** `201 Created`
```json
{
  "message": "License uploaded successfully",
  "url": "https://storage.example.com/licenses/license.pdf"
}
```

---

#### 9.2 Upload Resume
Upload a resume file.

**Endpoint:** `POST /api/upload/resume`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file) - Resume file (PDF, DOC, etc.)

**Response:** `201 Created`
```json
{
  "message": "Resume uploaded successfully",
  "url": "https://storage.example.com/resumes/resume.pdf"
}
```

---

#### 9.3 Upload Logo
Upload a logo file.

**Endpoint:** `POST /api/upload/logo`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file) - Logo file (image)

**Response:** `201 Created`
```json
{
  "message": "Logo uploaded successfully",
  "url": "https://storage.example.com/logos/logo.png"
}
```

---

#### 9.4 Upload Avatar
Upload an avatar file.

**Endpoint:** `POST /api/upload/avatar`  
**Authentication:** Required  
**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (file) - Avatar file (image)

**Response:** `201 Created`
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://storage.example.com/avatars/avatar.png"
}
```

---

### 10. Admin

#### 10.1 Approve Entity
Approve or reject a company or organization (admin only).

**Endpoint:** `POST /api/admin/approve`  
**Authentication:** Required (Admin role)

**Request Body:**
```json
{
  "entityType": "organization",
  "entityId": "uuid",
  "approved": true
}
```

**Entity Types:** `organization`, `company`

**Response:** `200 OK`
```json
{
  "message": "Entity approval status updated successfully",
  "entity": {
    "id": "uuid",
    "approved": true
  }
}
```

---

#### 10.2 Get Pending Approvals
Get all pending approvals (admin only).

**Endpoint:** `GET /api/admin/pending`  
**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corp",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "organizations": [
    {
      "id": "uuid",
      "name": "ABC Construction",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

#### 10.3 Get Analytics
Get analytics data (admin only).

**Endpoint:** `GET /api/admin/analytics`  
**Authentication:** Required (Admin role)

**Response:** `200 OK`
```json
{
  "total_users": 1000,
  "total_jobs": 500,
  "total_tenders": 300,
  "total_companies": 200,
  "total_organizations": 150,
  "pending_approvals": 25
}
```

---

## Data Models

### User/Profile
```typescript
{
  id: string (UUID)
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  avatar_url: string | null
  bio: string | null
  email_verified: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### Job
```typescript
{
  id: string (UUID)
  company_id: string
  title: string
  description: string
  requirements: string | null
  salary_min: number | null
  salary_max: number | null
  employment_type: string | null
  experience_level: string | null
  status: JobStatus
  location: string | null
  category: string | null
  created_at: DateTime
  updated_at: DateTime
}
```

### Tender
```typescript
{
  id: string (UUID)
  organization_id: string
  title: string
  description: string
  requirements: string | null
  deadline: DateTime | null
  status: TenderStatus
  location: string | null
  category: string | null
  created_at: DateTime
  updated_at: DateTime
}
```

### Company
```typescript
{
  id: string (UUID)
  user_id: string
  name: string
  description: string | null
  website: string | null
  logo_url: string | null
  location: string | null
  industry: string | null
  size: string | null
  approved: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### Organization
```typescript
{
  id: string (UUID)
  user_id: string
  name: string
  description: string | null
  website: string | null
  logo_url: string | null
  location: string | null
  industry: string | null
  license_number: string | null
  license_file_url: string | null
  work_sectors: string[]
  approved: boolean
  created_at: DateTime
  updated_at: DateTime
}
```

### JobApplication
```typescript
{
  id: string (UUID)
  job_id: string
  user_id: string
  status: ApplicationStatus
  cover_letter: string | null
  resume_url: string | null
  created_at: DateTime
  updated_at: DateTime
}
```

### TenderApplication
```typescript
{
  id: string (UUID)
  tender_id: string
  user_id: string
  status: ApplicationStatus
  cover_letter: string | null
  resume_url: string | null
  created_at: DateTime
  updated_at: DateTime
}
```

---

## Enums

### UserRole
- `user` - Regular user
- `organization` - Organization account
- `company` - Company account
- `admin` - Administrator

### JobStatus
- `open` - Job is open for applications
- `closed` - Job is closed
- `draft` - Job is in draft mode

### TenderStatus
- `open` - Tender is open for applications
- `closed` - Tender is closed
- `draft` - Tender is in draft mode

### ApplicationStatus
- `pending` - Application is pending review
- `reviewed` - Application has been reviewed
- `accepted` - Application has been accepted
- `rejected` - Application has been rejected

### ReportStatus
- `new` - New report
- `in_review` - Report is being reviewed
- `resolved` - Report has been resolved

---

## Integration Guide

### For Frontend Developers Using Cursor

This API documentation provides all the information needed to integrate with the RT Backend API. Here's a quick integration guide:

#### 1. Base Configuration

Set up your API base URL and authentication:

```typescript
// api/config.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Create axios instance or fetch wrapper
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### 2. Authentication Flow

```typescript
// api/auth.ts
export const authAPI = {
  signup: async (data: SignUpDto) => {
    const response = await apiClient.post('/auth/signup', data);
    return response.data;
  },

  login: async (data: LoginDto) => {
    const response = await apiClient.post('/auth/login', data);
    // Store tokens
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },

  verifyEmail: async (data: VerifyEmailDto) => {
    const response = await apiClient.post('/auth/verify-email', data);
    return response.data;
  },

  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    const response = await apiClient.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    localStorage.setItem('access_token', response.data.access_token);
    localStorage.setItem('refresh_token', response.data.refresh_token);
    return response.data;
  },
};
```

#### 3. Type Definitions

Create TypeScript types based on the data models:

```typescript
// types/api.ts
export enum UserRole {
  USER = 'user',
  ORGANIZATION = 'organization',
  COMPANY = 'company',
  ADMIN = 'admin',
}

export enum JobStatus {
  OPEN = 'open',
  CLOSED = 'closed',
  DRAFT = 'draft',
}

export enum ApplicationStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  company_id: string;
  title: string;
  description: string;
  requirements?: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
  status: JobStatus;
  location?: string;
  category?: string;
  created_at: string;
  updated_at: string;
}
```

#### 4. API Service Examples

```typescript
// api/jobs.ts
export const jobsAPI = {
  getAll: async (filters?: { search?: string; category?: string; location?: string }) => {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.location) params.append('location', filters.location);
    
    const response = await apiClient.get(`/jobs?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: CreateJobDto) => {
    const response = await apiClient.post('/jobs', data);
    return response.data;
  },

  update: async (id: string, data: UpdateJobDto) => {
    const response = await apiClient.patch(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/jobs/${id}`);
    return response.data;
  },
};
```

#### 5. File Upload Example

```typescript
// api/storage.ts
export const storageAPI = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload/resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
```

#### 6. Error Handling

```typescript
// utils/errorHandler.ts
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try to refresh token
      try {
        await authAPI.refreshToken();
        // Retry original request
        return apiClient.request(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

#### 7. React Hook Example

```typescript
// hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsAPI } from '@/api/jobs';

export const useJobs = (filters?: { search?: string; category?: string; location?: string }) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => jobsAPI.getAll(filters),
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: jobsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};
```

### Testing with Swagger UI

1. Start the backend server
2. Navigate to `http://localhost:{port}/api/docs`
3. Click "Authorize" button and enter your JWT token
4. Test endpoints directly from the Swagger UI

### Important Notes

- All timestamps are in ISO 8601 format (e.g., `2024-01-01T00:00:00Z`)
- All IDs are UUIDs (strings)
- Dates should be sent as ISO date strings
- File uploads use `multipart/form-data` content type
- Query parameters are optional unless specified
- Admin endpoints require user role to be `admin`
- Some endpoints are public (no authentication required)
- CORS is configured to allow requests from the frontend URL

---

## Support

For questions or issues:
- Check Swagger UI at `/api/docs` for interactive API testing
- Review error responses for detailed validation messages
- Ensure authentication tokens are included for protected endpoints

---

**Last Updated:** 2024  
**API Version:** 1.0


