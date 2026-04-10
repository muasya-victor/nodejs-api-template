
# Node.js CRM API Template

A production-ready REST API template with Express, Prisma, PostgreSQL, and TypeScript. Includes authentication-ready structure, logging, error handling, pagination, and best practices.

##  Features

-  **Express 5** with TypeScript
-  **Prisma ORM** with PostgreSQL/SQLite support
-  **Repository-Service-Controller** pattern
-  **Automatic Pagination** (Django-style)
-  **Centralized Error Handling**
-  **Request Logging** with Winston
-  **Database Audit Trail**
-  **Environment Configuration**
-  **Hot Reload** with tsx
-  **Production Ready** structure

##  Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (or SQLite for development)
- npm or yarn or pnpm

##   Quick Start

### 1. Clone the template

```bash
git clone https://github.com/muasya-victor/nodejs-api-template
cd node-crm-template
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crm_db"
NODE_ENV=development
PORT=4000
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
```env
# Change DATABASE_URL in .env
DATABASE_URL="file:./dev.db"
```

```bash
npx prisma migrate dev --name init
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

##  API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users` | Get all users (paginated) |
| GET | `/api/v1/users/:id` | Get user by ID |
| POST | `/api/v1/users` | Create new user |
| PUT | `/api/v1/users/:id` | Update user |
| DELETE | `/api/v1/users/:id` | Delete user |
| GET | `/health` | Health check |

### Pagination

All list endpoints support pagination:

```bash
# Basic pagination
GET /api/v1/users?page=2&limit=20

# With sorting
GET /api/v1/users?sortBy=name&sortOrder=asc

# Combined
GET /api/v1/users?page=1&limit=10&sortBy=email&sortOrder=desc
```

**Response:**
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

### Create User

```bash
curl -X POST http://localhost:4000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com"
  }'
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

##     Project Structure

```
node-crm/
├── src/
│   ├── config/           # Configuration files
│   │   ├── prisma.ts     # Prisma client setup
│   │   └── logger.ts     # Winston logger config
│   ├── controllers/      # Request handlers
│   │   └── user.controller.ts
│   ├── middlewares/      # Express middlewares
│   │   ├── errorHandler.ts
│   │   └── pagination.ts
│   ├── repositories/     # Database operations
│   │   ├── base.repository.ts
│   │   └── user.repository.ts
│   ├── services/         # Business logic
│   │   └── user.service.ts
│   ├── types/            # TypeScript types
│   │   ├── user.ts
│   │   └── pagination.ts
│   ├── utils/            # Utility functions
│   │   ├── errors.ts
│   │   └── paginate.ts
│   ├── routes/           # API routes
│   │   └── user.routes.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── migrations/       # Database migrations
├── logs/                 # Application logs
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

##  Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm start            # Start production server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio
```

##  Configuration

### Database

The template supports both PostgreSQL and SQLite:

- **PostgreSQL**: Recommended for production
- **SQLite**: Great for development and testing

### Logging

Logs are stored in the `logs/` directory:
- `error.log` - Error-level logs
- `combined.log` - All logs
- `requests.log` - HTTP requests
- `audit.log` - Audit trail

### Error Handling

Custom error classes for consistent responses:

```typescript
throw new AppError("User not found", 404);
throw new AppError("Unauthorized", 401);
throw new AppError("Conflict", 409);
```

##  Testing

```bash
# Run tests (when implemented)
npm test

# Test API with curl
curl http://localhost:4000/health
```

##  Dependencies

### Production
- `express` - Web framework
- `@prisma/client` - Database ORM
- `winston` - Logging
- `dotenv` - Environment variables
- `pg` - PostgreSQL driver

### Development
- `typescript` - Type safety
- `tsx` - TypeScript execution
- `prisma` - Database toolkit
- `@types/*` - Type definitions

##  Deployment

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

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

##    Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

##    License

MIT License - feel free to use this template for any project!

##     Acknowledgments

- Express.js team
- Prisma ORM team
- All contributors

## 📧 Contact

For questions or support:
- Create an issue on GitHub
- Email: victor.m.muasya@gmail.com

---

##  Quick Commands Reference

```bash
# Development
npm run dev

# Database
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client

# Production
npm run build
npm start

# Utilities
npx tsx src/scripts/seed.ts  # Run seed script
tail -f logs/error.log       # Watch error logs
```

##  Next Steps

1. Add authentication (JWT)
2. Add role-based access control
3. Add email notifications
4. Add file uploads
5. Add API documentation (Swagger)
6. Add unit tests
7. Add CI/CD pipeline

---

**Built with love using Node.js, Express, and Prisma**
```

## Also create `.env.example`:

```env
# .env.example
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_db"

# For SQLite (development)
# DATABASE_URL="file:./dev.db"

# Server
PORT=4000
NODE_ENV=development

# Logging
LOG_LEVEL=info

# Security (add when implementing auth)
# JWT_SECRET=your-super-secret-jwt-key
# JWT_EXPIRES_IN=7d

# Email (add when implementing email)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
```

## And a `LICENSE` file:

```txt
MIT License

Copyright (c) 2024 Victor Mwendwa

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
```

