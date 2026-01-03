# RT-SYR Backend (NestJS + Prisma)

This is the NestJS backend for the RT-SYR (Recruitments & Tenders Syria) platform, providing a robust API for job postings, tender management, and user applications with JWT authentication.

## Tech Stack

- **Framework**: NestJS 10.x
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT with Passport
- **File Storage**: Supabase Storage
- **Email**: Nodemailer (OTP verification)
- **Validation**: class-validator & class-transformer

## Features

✅ **Authentication & Authorization**
- JWT-based authentication with access & refresh tokens
- Email verification with OTP
- Role-based access control (User, Company, Organization, Admin)
- Password policy enforcement

✅ **Core Modules**
- Profiles management
- Companies management with approval workflow
- Organizations management with approval workflow
- Jobs posting with free quota limits (2 per company)
- Tenders posting with free quota limits (2 per organization)
- Secondary accounts for organizations

✅ **Applications**
- Job applications with duplicate prevention
- Tender applications with duplicate prevention
- Application status management

✅ **Admin Features**
- Entity approval/rejection
- Pending approvals dashboard
- Analytics and reporting
- Report management

✅ **File Uploads**
- Organization licenses (PDF)
- User resumes (PDF/DOC/DOCX)
- Company/Organization logos (Images)
- User avatars (Images)

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── admin/                 # Admin module
│   ├── applications/          # Job & tender applications
│   ├── auth/                  # Authentication & authorization
│   │   ├── decorators/        # Custom decorators (Roles, Public, CurrentUser)
│   │   ├── dto/               # Data transfer objects
│   │   ├── guards/            # JWT & Roles guards
│   │   └── strategies/        # Passport strategies
│   ├── companies/             # Companies management
│   ├── config/                # Configuration
│   ├── jobs/                  # Jobs management
│   ├── organizations/         # Organizations management
│   ├── prisma/                # Prisma service
│   ├── profiles/              # User profiles
│   ├── reports/               # Reports & notifications
│   ├── storage/               # File storage (Supabase)
│   ├── tenders/               # Tenders management
│   ├── app.module.ts          # Root module
│   └── main.ts                # Application entry point
└── .env                       # Environment variables
```

## Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rt_syr?schema=public"

# JWT
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Application
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Email (for OTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
# EMAIL_FROM is optional - defaults to using SMTP_USER as sender
# EMAIL_FROM="RT-SYR <your-email@example.com>"

# Supabase Storage
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET_LICENSES="organization-licenses"
SUPABASE_STORAGE_BUCKET_RESUMES="resumes"
SUPABASE_STORAGE_BUCKET_LOGOS="logos"
SUPABASE_STORAGE_BUCKET_AVATARS="avatars"
```

## Installation

```bash
cd backend
npm install
```

## Database Setup

1. Create a PostgreSQL database
2. Configure DATABASE_URL in `.env`
3. Generate Prisma Client:

```bash
npx prisma generate
```

4. Run migrations:

```bash
npx prisma migrate dev
```

5. (Optional) Seed database:

```bash
npx prisma db seed
```

## Running the Application

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3001/api`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/refresh` - Refresh access token

### Profiles

- `GET /api/profiles/me` - Get current user profile
- `PATCH /api/profiles/me` - Update current user profile

### Companies

- `POST /api/companies` - Create company
- `GET /api/companies/my` - Get my companies
- `GET /api/companies/:id` - Get company details
- `PATCH /api/companies/:id` - Update company
- `GET /api/companies/:id/quota` - Get posting quota

### Organizations

- `POST /api/organizations` - Create organization
- `GET /api/organizations/my` - Get my organizations
- `GET /api/organizations/:id` - Get organization details
- `PATCH /api/organizations/:id` - Update organization
- `GET /api/organizations/:id/quota` - Get posting quota
- `POST /api/organizations/:id/secondary-accounts` - Invite secondary account
- `GET /api/organizations/:id/secondary-accounts` - List secondary accounts
- `POST /api/organizations/secondary-accounts/accept/:token` - Accept invitation

### Jobs

- `POST /api/jobs` - Create job (requires approved company)
- `GET /api/jobs` - List all open jobs (public)
- `GET /api/jobs/:id` - Get job details (public)
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/company/:companyId` - Get jobs by company

### Tenders

- `POST /api/tenders` - Create tender (requires approved organization)
- `GET /api/tenders` - List all open tenders (public)
- `GET /api/tenders/:id` - Get tender details (public)
- `PATCH /api/tenders/:id` - Update tender
- `DELETE /api/tenders/:id` - Delete tender
- `GET /api/tenders/organization/:organizationId` - Get tenders by organization

### Applications

- `POST /api/applications/jobs/:id/apply` - Apply to job
- `GET /api/applications/jobs/my` - Get my job applications
- `GET /api/applications/jobs/company/:companyId` - Get job applications for company
- `PATCH /api/applications/jobs/:id/status` - Update job application status
- `POST /api/applications/tenders/:id/apply` - Apply to tender
- `GET /api/applications/tenders/my` - Get my tender applications
- `GET /api/applications/tenders/organization/:organizationId` - Get tender applications for organization
- `PATCH /api/applications/tenders/:id/status` - Update tender application status

### Admin (Admin Role Required)

- `POST /api/admin/approve` - Approve/reject entity
- `GET /api/admin/pending` - Get pending approvals
- `GET /api/admin/analytics` - Get system analytics

### Reports

- `POST /api/reports` - Submit report (public/authenticated)
- `GET /api/reports` - Get all reports (admin only)
- `GET /api/reports/:id` - Get report details (admin only)
- `PATCH /api/reports/:id/status` - Update report status (admin only)
- `GET /api/reports/notifications` - Get unread report notifications (admin only)

### File Uploads

- `POST /api/upload/license` - Upload organization license
- `POST /api/upload/resume` - Upload resume
- `POST /api/upload/logo` - Upload company/organization logo
- `POST /api/upload/avatar` - Upload user avatar

## Business Logic

### Free Post Limits

- Companies: 2 free job postings
- Organizations: 2 free tender postings
- Enforced at database and application level
- Users receive clear error messages when limits are reached

### Approval Workflow

- Companies and organizations must be approved by admin before posting
- Approval status checked on every posting attempt
- Admin dashboard shows pending approvals

### Role-Based Access Control

- **User**: Can apply to jobs and tenders
- **Company**: Can manage companies and job postings
- **Organization**: Can manage organizations and tender postings
- **Admin**: Full access to all resources and admin features

### Email Verification

- OTP sent to email on signup
- 15-minute expiration
- Required before login
- Can resend OTP if expired

## Security

- JWT tokens with short expiration (15 minutes for access, 7 days for refresh)
- Password hashing with bcrypt
- Role-based guards on all sensitive endpoints
- File upload validation (type and size)
- CORS configured for frontend origin
- SQL injection prevention via Prisma
- XSS protection via validation pipes

## Development

### Generate Prisma Types

```bash
npx prisma generate
```

### Create Migration

```bash
npx prisma migrate dev --name migration_name
```

### View Database

```bash
npx prisma studio
```

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Testing

```bash
# Unit tests
npm run test

# e2e tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

1. Set `NODE_ENV=production`
2. Configure production database URL
3. Set secure JWT secrets
4. Configure SMTP for email
5. Set up Supabase Storage buckets
6. Run migrations: `npx prisma migrate deploy`
7. Build: `npm run build`
8. Start: `npm run start:prod`

## License

Private - RT-SYR Project
