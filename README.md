# Node.js CRM API Template

A production-ready REST API template with Express, Prisma, PostgreSQL, and TypeScript. Includes authentication, pagination, logging, error handling, and best practices.

## Author

**Victor Muasya**
- Email: victor.m.muasya@gmail.com
- GitHub: [muasya-victor](https://github.com/muasya-victor)

## Features

- JWT Authentication with bcrypt password hashing
- Global user context using AsyncLocalStorage (access current user anywhere)
- Role-based access control (Admin, Manager, User roles)
- Automatic pagination (Django-style)
- Centralized error handling with custom error classes
- Request logging with Winston (separate files for errors, requests, and audit)
- Database audit trail for important actions
- Repository-Service-Controller pattern
- Full TypeScript support with Prisma generated types
- PostgreSQL support with SQLite option for development
- Environment configuration with dotenv
- Hot reload with tsx

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (or SQLite for development)
- npm or yarn or pnpm

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/muasya-victor/nodejs-api-template.git
cd nodejs-api-template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"

# For SQLite (development)
# DATABASE_URL="file:./dev.db"

# JWT Authentication
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Server
PORT=4000
NODE_ENV=development

# Logging
LOG_LEVEL=info
```

### 4. Set up the database

**For PostgreSQL:**

```bash
# Create database
createdb crm_db

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

**For SQLite (development only):**

```bash
# Change DATABASE_URL in .env to:
DATABASE_URL="file:./dev.db"

# Run migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate
```

### 5. Start the server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

Your server will run at `http://localhost:4000`

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register a new user | No |
| POST | `/api/v1/auth/login` | Login and receive JWT token | No |
| GET | `/api/v1/auth/me` | Get current authenticated user | Yes |

### User Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/users` | Get all users (paginated) | No |
| GET | `/api/v1/users/me` | Get current user's profile | Yes |
| PUT | `/api/v1/users/me` | Update current user's profile | Yes |
| DELETE | `/api/v1/users/me` | Delete current user's account | Yes |
| GET | `/api/v1/users/:id` | Get user by ID | Yes |
| POST | `/api/v1/users` | Create new user | No |
| PUT | `/api/v1/users/:id` | Update user (Admin only) | Yes |
| DELETE | `/api/v1/users/:id` | Delete user (Admin only) | Yes |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check endpoint |

## Authentication

### Register a new user

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "message": "Registration successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Access Protected Routes

Use the token from login in the Authorization header:

```bash
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Pagination

All list endpoints support pagination with query parameters:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number (starts at 1) |
| limit | integer | 10 | Items per page (max 100) |
| sortBy | string | id | Field to sort by |
| sortOrder | string | desc | Sort order (asc or desc) |

### Examples

```bash
# Basic pagination
GET /api/v1/users?page=2&limit=20

# With sorting
GET /api/v1/users?sortBy=name&sortOrder=asc

# Combined
GET /api/v1/users?page=1&limit=10&sortBy=email&sortOrder=desc
```

### Pagination Response

```json
{
  "message": "Users retrieved successfully",
  "data": [...],
  "page": 1,
  "limit": 10,
  "total": 45,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

## Error Handling

The API uses consistent error response format:

```json
{
  "message": "Error description",
  "status": 400,
  "errorType": "AppError"
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

### Custom Error Classes

```typescript
throw new AppError("User not found", 404);
throw new AppError("Unauthorized access", 401);
throw new AppError("Email already exists", 409);
```

## Logging

Logs are stored in the `logs/` directory:

| Log File | Content |
|----------|---------|
| `error.log` | Error-level logs only |
| `combined.log` | All application logs |
| `requests.log` | HTTP request details |
| `audit.log` | Audit trail for important actions |

### View Logs

```bash
# Watch all logs in real-time
tail -f logs/combined.log

# Watch only errors
tail -f logs/error.log

# Watch API requests
tail -f logs/requests.log

# Watch audit trail
tail -f logs/audit.log
```

## Project Structure

```
nodejs-api-template/
├── src/
│   ├── config/              # Configuration files
│   │   ├── prisma.ts        # Prisma client setup
│   │   └── logger.ts        # Winston logger configuration
│   ├── context/             # AsyncLocalStorage context
│   │   └── request.context.ts  # Current user context
│   ├── controllers/         # Request handlers
│   │   └── user.controller.ts
│   ├── middlewares/         # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── context.middleware.ts
│   │   └── error-logging.middleware.ts
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── auth.service.ts
│   │   ├── core/            # Core modules
│   │   │   └── base.repository.ts
│   │   ├── log/             # Logging module
│   │   │   ├── log.repository.ts
│   │   │   └── log.service.ts
│   │   └── user/            # User module
│   │       ├── user.controller.ts
│   │       ├── user.repository.ts
│   │       ├── user.routes.ts
│   │       └── user.service.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── auth.types.ts
│   │   ├── log.types.ts
│   │   ├── pagination.ts
│   │   └── user.types.ts
│   ├── utils/               # Utility functions
│   │   ├── errors.ts
│   │   └── paginate.ts
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # Database migrations
├── logs/                    # Application logs (gitignored)
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Available Scripts

```bash
npm run dev                # Start development server with hot reload
npm run build              # Build for production
npm start                  # Start production server
npx prisma generate        # Generate Prisma client
npx prisma migrate dev     # Run database migrations
npx prisma studio          # Open Prisma Studio (database GUI)
```

## Database Schema

### User Model

```prisma
model User {
  id        Int       @id @default(autoincrement())
  name      String
  email     String    @unique
  password  String
  role      Role      @default(USER)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  logs      Log[]
}

enum Role {
  USER
  ADMIN
  MANAGER
}
```

### Log Model

```prisma
model Log {
  id        Int       @id @default(autoincrement())
  level     LogLevel  @default(INFO)
  action    String
  message   String
  userId    Int?
  metadata  Json?
  ip        String?
  userAgent String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  user      User?     @relation(fields: [userId], references: [id])
}

enum LogLevel {
  DEBUG
  INFO
  WARN
  ERROR
  CRITICAL
}
```

## Global User Context

Access the current authenticated user anywhere in your application:

```typescript
import { getCurrentUser, getCurrentUserId, isAdmin } from "@/context/request.context.js";

// In any service or repository
const userId = getCurrentUserId();
const currentUser = getCurrentUser();

if (isAdmin()) {
  // Perform admin-only operations
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL or SQLite connection string |
| JWT_SECRET | Yes | - | Secret key for JWT signing |
| JWT_EXPIRES_IN | No | 7d | JWT token expiration time |
| PORT | No | 4000 | Server port |
| NODE_ENV | No | development | Environment (development/production) |
| LOG_LEVEL | No | info | Logging level (debug/info/warn/error) |

## Deployment

### Deploy to Render

1. Push code to GitHub
2. Create new Web Service on Render
3. Connect your repository
4. Add environment variables
5. Build command: `npm install && npx prisma generate && npm run build`
6. Start command: `npm start`

### Deploy to Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

### Deploy to Heroku

```bash
# Add to package.json
"scripts": {
  "heroku-postbuild": "npm run build && npx prisma generate"
}

# Deploy
git push heroku main
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Test API with curl
curl http://localhost:4000/health

# Test authentication flow
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Test database connection
psql -d postgres -c "SELECT 1"
```

### JWT Token Issues

- Ensure JWT_SECRET is set in .env
- Token expires after JWT_EXPIRES_IN (default 7 days)
- Use "Bearer " prefix in Authorization header

### Logging Issues

```bash
# Create logs directory if missing
mkdir -p logs

# Check write permissions
chmod 755 logs
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

## License

MIT License

Copyright (c) 2026 Victor Muasya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Acknowledgments

- Express.js team for the web framework
- Prisma ORM team for the database toolkit
- Winston for logging
- JSON Web Token for authentication
- All contributors and open source community

## Contact

Victor Muasya - victor.m.muasya@gmail.com

GitHub: [github.com/muasya-victor](https://github.com/muasya-victor)

Project Link: [github.com/muasya-victor/nodejs-api-template](https://github.com/muasya-victor/nodejs-api-template)
