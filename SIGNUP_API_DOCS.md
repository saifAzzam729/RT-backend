# Sign Up API Documentation

## Endpoint

**POST** `/api/auth/signup`

## Description

Register a new user account. This endpoint creates a signup request that requires admin approval before the user can log in. The signup request will be in a "pending" status until approved by an admin.

## Authentication

No authentication required (public endpoint)

## Request Headers

```
Content-Type: application/json
```

## Request Body

| Field | Type | Required | Description | Validation Rules |
|-------|------|----------|-------------|-----------------|
| `email` | string | Yes | User email address | Must be a valid email format |
| `password` | string | Yes | User password | - Minimum 8 characters<br>- Must contain at least one uppercase letter<br>- Must contain at least one lowercase letter<br>- Must contain at least one number<br>- Must contain at least one special character (@$!%*?&) |
| `full_name` | string | Yes | Full name of the user | Cannot be empty |
| `role` | string | Yes | User role | Must be one of: `user`, `organization`, `company`, `admin` |
| `phone` | string | No | User phone number | Optional, but if provided must be unique |
| `drive_link` | string | No | Google Drive link | Must be a valid URL if provided |
| `commercial_file_url` | string | No | Commercial file URL | Must be a valid URL if provided |

## Request Example

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "role": "user",
  "phone": "+1234567890",
  "drive_link": "https://drive.google.com/...",
  "commercial_file_url": "https://storage.example.com/commercial/file.pdf"
}
```

### Minimal Request Example

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "role": "user"
}
```

## Success Response

**Status Code:** `201 Created`

```json
{
  "message": "Signup request submitted successfully. Please wait for admin approval.",
  "requestId": "uuid-string",
  "email": "user@example.com"
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Success message |
| `requestId` | string | UUID of the created signup request |
| `email` | string | Email address of the user |

## Error Responses

### 400 Bad Request

**Invalid request data (validation errors)**

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 8 characters",
    "password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "full_name should not be empty",
    "role must be one of the following values: user, organization, company, admin"
  ],
  "error": "Bad Request"
}
```

### 409 Conflict

**User already exists**

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

**Phone number already in use**

```json
{
  "statusCode": 409,
  "message": "User with this phone number already exists",
  "error": "Conflict"
}
```

**Pending signup request exists**

```json
{
  "statusCode": 409,
  "message": "A signup request with this email is already pending approval",
  "error": "Conflict"
}
```

## Frontend Implementation Example

### JavaScript/TypeScript (Fetch API)

```typescript
async function signUp(userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'organization' | 'company' | 'admin';
  phone?: string;
  drive_link?: string;
  commercial_file_url?: string;
}) {
  try {
    const response = await fetch('http://your-api-url/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }

    const data = await response.json();
    console.log('Signup successful:', data);
    return data;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
}

// Usage
signUp({
  email: 'user@example.com',
  password: 'Password123!',
  full_name: 'John Doe',
  role: 'user',
  phone: '+1234567890'
});
```

### Axios Example

```typescript
import axios from 'axios';

async function signUp(userData: {
  email: string;
  password: string;
  full_name: string;
  role: 'user' | 'organization' | 'company' | 'admin';
  phone?: string;
  drive_link?: string;
  commercial_file_url?: string;
}) {
  try {
    const response = await axios.post(
      'http://your-api-url/api/auth/signup',
      userData,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
    throw error;
  }
}
```

## Important Notes

1. **Admin Approval Required**: After successful signup, the user account is not immediately active. The signup request must be approved by an admin before the user can log in.

2. **Email Uniqueness**: The email address must be unique across all users and pending signup requests.

3. **Phone Uniqueness**: If a phone number is provided, it must be unique across all users.

4. **Password Requirements**: The password must meet all validation criteria:
   - Minimum 8 characters
   - At least one uppercase letter (A-Z)
   - At least one lowercase letter (a-z)
   - At least one number (0-9)
   - At least one special character (@$!%*?&)

5. **Role Values**: The `role` field must be exactly one of:
   - `user` - Regular user/job seeker
   - `organization` - Organization account
   - `company` - Company account
   - `admin` - Admin account (typically restricted)

6. **URL Validation**: If `drive_link` or `commercial_file_url` are provided, they must be valid URLs.

7. **Next Steps**: After signup, users typically need to:
   - Wait for admin approval
   - Verify their email (if email verification is enabled)
   - Then they can log in using the `/api/auth/login` endpoint

## Related Endpoints

- **Login**: `POST /api/auth/login` - Login after account is approved
- **Verify Email**: `POST /api/auth/verify-email` - Verify email with OTP
- **Resend Verification**: `POST /api/auth/resend-verification` - Resend OTP code

