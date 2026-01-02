# Admin Endpoints - Company & Organization Requests

## Overview

This documentation covers admin endpoints for listing and managing company and organization signup requests. These endpoints require admin authentication.

---

## 1. List All Signup Requests

### Endpoint

**GET** `/api/admin/signup-requests`

### Description

Retrieves all signup requests with pagination support. This includes requests from users, companies, and organizations. You can filter by status and filter the results client-side by role to get only company or organization requests.

### Authentication

**Required:** Bearer Token (Admin role only)

### Request Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Number of items per page |
| `status` | string | No | - | Filter by status: `pending`, `approved`, `rejected`, `need_more_info` |

### Request Example

```bash
# Get all pending signup requests
GET /api/admin/signup-requests?status=pending&page=1&limit=20

# Get all signup requests (any status)
GET /api/admin/signup-requests?page=1&limit=20
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "requests": [
    {
      "id": "uuid-string",
      "email": "company@example.com",
      "full_name": "John Doe",
      "role": "company",
      "phone": "+1234567890",
      "drive_link": "https://drive.google.com/...",
      "commercial_file_url": "https://storage.example.com/file.pdf",
      "status": "pending",
      "reason_note": null,
      "reviewed_by_id": null,
      "reviewed_at": null,
      "user_id": null,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "reviewed_by": null
    },
    {
      "id": "uuid-string-2",
      "email": "org@example.com",
      "full_name": "Jane Smith",
      "role": "organization",
      "phone": "+0987654321",
      "drive_link": null,
      "commercial_file_url": null,
      "status": "pending",
      "reason_note": null,
      "reviewed_by_id": null,
      "reviewed_at": null,
      "user_id": null,
      "created_at": "2024-01-14T09:20:00.000Z",
      "updated_at": "2024-01-14T09:20:00.000Z",
      "reviewed_by": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `requests` | array | Array of signup request objects |
| `requests[].id` | string | Unique request ID (UUID) |
| `requests[].email` | string | Email address of the requester |
| `requests[].full_name` | string | Full name of the requester |
| `requests[].role` | string | User role: `user`, `company`, `organization`, or `admin` |
| `requests[].phone` | string \| null | Phone number (optional) |
| `requests[].drive_link` | string \| null | Google Drive link (optional) |
| `requests[].commercial_file_url` | string \| null | Commercial file URL (optional) |
| `requests[].status` | string | Request status: `pending`, `approved`, `rejected`, `need_more_info` |
| `requests[].reason_note` | string \| null | Admin's reason note (for rejected/need_more_info) |
| `requests[].reviewed_by_id` | string \| null | ID of admin who reviewed the request |
| `requests[].reviewed_at` | string \| null | Timestamp when request was reviewed |
| `requests[].user_id` | string \| null | ID of created user (if approved) |
| `requests[].created_at` | string | Request creation timestamp (ISO 8601) |
| `requests[].updated_at` | string | Request last update timestamp (ISO 8601) |
| `requests[].reviewed_by` | object \| null | Admin user who reviewed (if reviewed) |
| `pagination` | object | Pagination metadata |
| `pagination.page` | number | Current page number |
| `pagination.limit` | number | Items per page |
| `pagination.total` | number | Total number of requests |
| `pagination.totalPages` | number | Total number of pages |

### Filtering by Role (Client-Side)

Since the API doesn't filter by role, filter the results on the frontend:

```typescript
// Get only company requests
const companyRequests = requests.filter(req => req.role === 'company');

// Get only organization requests
const orgRequests = requests.filter(req => req.role === 'organization');

// Get company and organization requests
const companyAndOrgRequests = requests.filter(
  req => req.role === 'company' || req.role === 'organization'
);
```

### Error Responses

**401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** (Not an admin)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 2. Get Pending Company & Organization Approvals

### Endpoint

**GET** `/api/admin/pending`

### Description

Retrieves all pending company and organization approvals. This endpoint returns companies and organizations that have been created but are not yet approved (`approved: false`). This is different from signup requests - these are entities that exist but need approval.

### Authentication

**Required:** Bearer Token (Admin role only)

### Request Headers

```
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
```

### Request Example

```bash
GET /api/admin/pending
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "organizations": [
    {
      "id": "uuid-string",
      "name": "Example Organization",
      "description": "Organization description",
      "website": "https://example.org",
      "logo_url": "https://storage.example.com/logo.png",
      "approved": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "org@example.com",
        "full_name": "Jane Smith"
      }
    }
  ],
  "companies": [
    {
      "id": "uuid-string",
      "name": "Example Company",
      "description": "Company description",
      "website": "https://example.com",
      "logo_url": "https://storage.example.com/logo.png",
      "approved": false,
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z",
      "user": {
        "id": "user-uuid",
        "email": "company@example.com",
        "full_name": "John Doe"
      }
    }
  ]
}
```

### Response Fields

#### Organizations Array

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Organization ID (UUID) |
| `name` | string | Organization name |
| `description` | string \| null | Organization description |
| `website` | string \| null | Organization website URL |
| `logo_url` | string \| null | Organization logo URL |
| `approved` | boolean | Approval status (always `false` for this endpoint) |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |
| `user` | object | Associated user profile |
| `user.id` | string | User ID |
| `user.email` | string | User email |
| `user.full_name` | string | User full name |

#### Companies Array

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Company ID (UUID) |
| `name` | string | Company name |
| `description` | string \| null | Company description |
| `website` | string \| null | Company website URL |
| `logo_url` | string \| null | Company logo URL |
| `approved` | boolean | Approval status (always `false` for this endpoint) |
| `created_at` | string | Creation timestamp (ISO 8601) |
| `updated_at` | string | Last update timestamp (ISO 8601) |
| `user` | object | Associated user profile |
| `user.id` | string | User ID |
| `user.email` | string | User email |
| `user.full_name` | string | User full name |

### Error Responses

**401 Unauthorized**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden** (Not an admin)

```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

---

## 3. Get Single Signup Request

### Endpoint

**GET** `/api/admin/signup-requests/:requestId`

### Description

Retrieves detailed information about a specific signup request by ID.

### Authentication

**Required:** Bearer Token (Admin role only)

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `requestId` | string | Yes | UUID of the signup request |

### Request Example

```bash
GET /api/admin/signup-requests/550e8400-e29b-41d4-a716-446655440000
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "company@example.com",
  "full_name": "John Doe",
  "role": "company",
  "phone": "+1234567890",
  "drive_link": "https://drive.google.com/...",
  "commercial_file_url": "https://storage.example.com/file.pdf",
  "status": "pending",
  "reason_note": null,
  "reviewed_by_id": null,
  "reviewed_at": null,
  "user_id": null,
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:30:00.000Z",
  "reviewed_by": null
}
```

### Error Responses

**404 Not Found**

```json
{
  "statusCode": 404,
  "message": "Signup request with ID {requestId} not found"
}
```

---

## Frontend Implementation Examples

### TypeScript/JavaScript (Fetch API)

```typescript
// Base API configuration
const API_BASE_URL = 'http://your-api-url/api';
const token = 'your-jwt-token';

// Get all signup requests (filtered by status)
async function getSignUpRequests(status?: string, page = 1, limit = 20) {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (status) {
    params.append('status', status);
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/signup-requests?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Get only company signup requests
async function getCompanySignUpRequests(status = 'pending') {
  const data = await getSignUpRequests(status);
  return {
    ...data,
    requests: data.requests.filter((req: any) => req.role === 'company'),
  };
}

// Get only organization signup requests
async function getOrganizationSignUpRequests(status = 'pending') {
  const data = await getSignUpRequests(status);
  return {
    ...data,
    requests: data.requests.filter((req: any) => req.role === 'organization'),
  };
}

// Get pending company and organization approvals
async function getPendingApprovals() {
  const response = await fetch(`${API_BASE_URL}/admin/pending`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Usage examples
async function loadCompanyRequests() {
  try {
    const data = await getCompanySignUpRequests('pending');
    console.log('Company requests:', data.requests);
    console.log('Total:', data.pagination.total);
  } catch (error) {
    console.error('Error loading company requests:', error);
  }
}

async function loadPendingApprovals() {
  try {
    const data = await getPendingApprovals();
    console.log('Pending companies:', data.companies);
    console.log('Pending organizations:', data.organizations);
  } catch (error) {
    console.error('Error loading pending approvals:', error);
  }
}
```

### Axios Example

```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://your-api-url/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Get signup requests
async function getSignUpRequests(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const response = await apiClient.get('/admin/signup-requests', { params });
  return response.data;
}

// Get company signup requests
async function getCompanySignUpRequests(status = 'pending') {
  const data = await getSignUpRequests({ status });
  return {
    ...data,
    requests: data.requests.filter((req: any) => req.role === 'company'),
  };
}

// Get organization signup requests
async function getOrganizationSignUpRequests(status = 'pending') {
  const data = await getSignUpRequests({ status });
  return {
    ...data,
    requests: data.requests.filter((req: any) => req.role === 'organization'),
  };
}

// Get pending approvals
async function getPendingApprovals() {
  const response = await apiClient.get('/admin/pending');
  return response.data;
}
```

---

## Important Notes

1. **Authentication Required**: All admin endpoints require a valid JWT token with admin role.

2. **Two Types of Requests**:
   - **Signup Requests**: Created when users sign up. These are in the `SignUpRequest` table and have statuses: `pending`, `approved`, `rejected`, `need_more_info`.
   - **Pending Approvals**: Companies and organizations that exist but haven't been approved yet (`approved: false`).

3. **Role Filtering**: The signup requests endpoint doesn't filter by role on the server. Filter by `role === 'company'` or `role === 'organization'` on the frontend.

4. **Pagination**: The signup requests endpoint supports pagination. Use `page` and `limit` query parameters.

5. **Status Values**: Signup request statuses are:
   - `pending` - Awaiting admin review
   - `approved` - Approved and user created
   - `rejected` - Rejected by admin
   - `need_more_info` - Admin requested more information

6. **Ordering**: 
   - Signup requests are ordered by `created_at` descending (newest first)
   - Pending approvals are ordered by `created_at` descending

---

## Related Endpoints

- **Approve Signup Request**: `POST /api/admin/signup-requests/:requestId/approve` - Approve, reject, or request more info for a signup request
- **Approve Entity**: `POST /api/admin/approve` - Approve or reject a company/organization entity

