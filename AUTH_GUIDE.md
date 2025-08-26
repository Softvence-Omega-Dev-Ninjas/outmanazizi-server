# Authentication Module Guide

This guide explains how to use the authentication module in your Outmanazizi Server.

## Features

✅ User Registration  
✅ User Login  
✅ JWT Authentication  
✅ Password Hashing (bcrypt)  
✅ User Profile Endpoint  
✅ Protected Routes  
✅ Swagger Documentation

## API Endpoints

### 1. Register User

**POST** `/auth/register`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "ckd2hs2r20000q8vz9v8v9v8v",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2. Login User

**POST** `/auth/login`

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "ckd2hs2r20000q8vz9v8v9v8v",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3. Get User Profile

**GET** `/auth/profile`

Headers:

```
Authorization: Bearer <your-jwt-token>
```

**Response:**

```json
{
  "id": "ckd2hs2r20000q8vz9v8v9v8v",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

## Setup Instructions

### 1. Environment Variables

Make sure your `.env` file contains:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/outmanazizi_db?schema=public"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"
```

### 2. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) View database in Prisma Studio
npx prisma studio
```

### 3. Run the Server

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## Protecting Routes

To protect routes in other controllers, use the `JwtAuthGuard`:

```typescript
import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  getProtectedData(@Request() req) {
    // req.user contains the authenticated user data
    return {
      message: 'This is protected data',
      user: req.user,
    };
  }
}
```

## User Model Schema

The User model includes:

- `id`: Unique identifier (cuid)
- `email`: User email (unique)
- `password`: Hashed password
- `firstName`: Optional first name
- `lastName`: Optional last name
- `isActive`: Account status (default: true)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

## Security Features

- **Password Hashing**: Uses bcrypt with 12 salt rounds
- **JWT Tokens**: Configurable expiration (default: 7 days)
- **Input Validation**: Email format, password length validation
- **User Status**: Can deactivate accounts
- **Error Handling**: Secure error messages (no sensitive data leakage)

## Error Responses

### 409 Conflict (Registration)

```json
{
  "statusCode": 409,
  "message": "User with this email already exists",
  "error": "Conflict"
}
```

### 401 Unauthorized (Login/Protected Routes)

```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### 400 Bad Request (Validation Error)

```json
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "Password must be at least 6 characters long"
  ],
  "error": "Bad Request"
}
```

## Testing with Swagger

1. Start your server: `npm run start:dev`
2. Open Swagger UI: `http://localhost:3000/docs`
3. Find the **Authentication** section
4. Test registration and login endpoints
5. Use the JWT token in the "Authorize" button to test protected routes

## Next Steps

You can extend this auth module by:

- Adding password reset functionality
- Implementing refresh tokens
- Adding role-based authorization
- Adding OAuth integration (Google, GitHub, etc.)
- Adding email verification
