# Node.js API Template - AI Assistant Skill Guide

## Project Overview

This is a production-ready Node.js REST API template built with Express, Prisma, PostgreSQL, and TypeScript. It follows the Repository-Service-Controller pattern and includes authentication, pagination, logging, and error handling.

## Technology Stack

- Runtime: Node.js (v18+)
- Language: TypeScript
- Framework: Express 5
- ORM: Prisma 7 with PostgreSQL/SQLite support
- Authentication: JWT with bcrypt
- Logging: Winston
- Development: tsx for hot reload

## Project Structure

```
src/
├── config/           # Configuration (prisma, logger)
├── context/          # AsyncLocalStorage for user context
├── controllers/      # HTTP request handlers
├── middlewares/      # Express middlewares (auth, context, logging)
├── modules/          # Feature modules (auth, user, log, core)
│   ├── auth/         # Authentication module
│   ├── user/         # User CRUD module
│   ├── log/          # Logging module
│   └── core/         # Base repository
├── types/            # TypeScript type definitions
├── utils/            # Utility functions (errors, paginate)
├── app.ts            # Express app setup
└── server.ts         # Entry point
```

## Architecture Pattern: Repository-Service-Controller

### Layer Responsibilities

1. **Controller** (`*.controller.ts`)
   - Receives HTTP requests
   - Validates request data
   - Calls service layer
   - Returns HTTP responses
   - Passes errors to next()

2. **Service** (`*.service.ts`)
   - Contains business logic
   - Orchestrates multiple repositories
   - Calls repository methods
   - Handles transactions
   - Throws AppError for business rule violations

3. **Repository** (`*.repository.ts`)
   - Extends BaseRepository
   - Performs database operations only
   - No business logic
   - Returns database models

### Base Repository Pattern

All repositories extend `BaseRepository<T>` which provides:

```typescript
class UserRepository extends BaseRepository<User> {
  constructor() {
    super(prisma.user);
  }
  // Custom methods here
}

// Available base methods:
- paginate(query, options)  // Automatic pagination
- findAll(options)
- findById(id)
- findOne(where)
- create(data)
- update(id, data)
- delete(id)
- count(where)
```

## Authentication System

### JWT Flow

1. User registers or logs in → receives JWT token
2. Client includes token in requests: `Authorization: Bearer <token>`
3. `authMiddleware` verifies token and attaches user to `req.user`
4. `contextMiddleware` makes user available via AsyncLocalStorage
5. Services/repositories access current user via `getCurrentUser()`

### Available Auth Utilities

```typescript
import { getCurrentUser, getCurrentUserId, isAdmin } from "@/context/request.context.js";

// Access current user anywhere
const user = getCurrentUser();     // Throws if not authenticated
const userId = getCurrentUserId(); // Returns number
const admin = isAdmin();           // Returns boolean
```

### Protected Routes

```typescript
import { authMiddleware } from "@/middlewares/auth.middleware.js";

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
```

## Pagination System

### Automatic Pagination

All list endpoints support pagination via query parameters:

```typescript
// In repository
async getUsers(query: any) {
  return await this.paginate(query);
}
```

### Query Parameters

| Parameter | Type | Default | Max |
|-----------|------|---------|-----|
| page | integer | 1 | - |
| limit | integer | 10 | 100 |
| sortBy | string | id | - |
| sortOrder | string | desc | asc/desc |

### Response Format

```json
{
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

### Custom Error Class

```typescript
// src/utils/errors.ts
export class AppError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Usage
throw new AppError("User not found", 404);
throw new AppError("Unauthorized", 401);
throw new AppError("Email already exists", 409);
```

### Global Error Handler

Errors are caught by the global error handler (last middleware in app.ts) which returns consistent responses:

```json
{
  "message": "Error description",
  "status": 400,
  "errorType": "AppError"
}
```

## Logging System

### Logger Usage

```typescript
import { logger } from "@/config/logger.js";

logger.info("User created", { userId: 123 });
logger.error("Payment failed", { error: error.message });
logger.warn("Rate limit approaching");
logger.debug("Debug info");
```

### Log Files

- `logs/error.log` - Errors only
- `logs/combined.log` - All logs
- `logs/requests.log` - HTTP requests
- `logs/audit.log` - Audit trail

### Audit Logging

```typescript
import { logService } from "@/modules/log/log.service.js";

await logService.logEvent({
  level: "INFO",
  action: "USER_CREATED",
  message: "User created successfully",
  userId: user.id,
  metadata: { email: user.email },
  ip: req.ip,
  userAgent: req.get("user-agent"),
});
```

## Database Schema

### Current Models

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
```

## Adding New Features

### Adding a New Model

1. Update `prisma/schema.prisma` with new model
2. Run `npx prisma migrate dev --name add_model`
3. Run `npx prisma generate`
4. Create repository extending BaseRepository
5. Create service with business logic
6. Create controller for HTTP handling
7. Add routes with appropriate middleware

### Example: Adding a Post Model

```typescript
// 1. Repository
class PostRepository extends BaseRepository<Post> {
  constructor() {
    super(prisma.post);
  }
  
  async findByUser(userId: number) {
    return await this.model.findMany({ where: { userId } });
  }
}

// 2. Service
export const postService = {
  createPost: async (data: CreatePostDTO, req?: any) => {
    const userId = getCurrentUserId();
    const post = await postRepository.create({ ...data, userId });
    await logService.logEvent({
      level: "INFO",
      action: "POST_CREATED",
      userId,
      metadata: { postId: post.id }
    });
    return post;
  }
};

// 3. Controller
export const createPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await postService.createPost(req.body, req);
    res.status(201).json({ message: "Post created", post });
  } catch (error) {
    next(error);
  }
};

// 4. Routes
router.post("/", authMiddleware, createPost);
router.get("/", authMiddleware, getMyPosts);
```

## Common Tasks

### Creating a Protected Endpoint

```typescript
// 1. Add method to service
getMyData: async () => {
  const userId = getCurrentUserId();
  return await repository.findByUser(userId);
}

// 2. Add controller
export const getMyData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await service.getMyData();
    res.json({ data });
  } catch (error) {
    next(error);
  }
};

// 3. Add route with auth middleware
router.get("/me", authMiddleware, getMyData);
```

### Adding Admin-Only Endpoint

```typescript
// In service
if (!isAdmin()) {
  throw new AppError("Admin access required", 403);
}

// In routes (double protection)
router.delete("/:id", authMiddleware, requireRole("ADMIN"), deleteUser);
```

### Adding Pagination to New Endpoint

```typescript
// In repository - already has paginate method
async getPostsPaginated(query: any) {
  return await this.paginate(query, {
    where: { published: true },
    include: { author: true }
  });
}

// Controller automatically receives pagination params from query
const result = await postService.getPostsPaginated(req.query);
```

## Environment Variables

Required variables:
- `DATABASE_URL` - PostgreSQL or SQLite connection string
- `JWT_SECRET` - Secret key for JWT signing

Optional variables:
- `JWT_EXPIRES_IN` - Token expiry (default: 7d)
- `PORT` - Server port (default: 4000)
- `NODE_ENV` - development/production
- `LOG_LEVEL` - debug/info/warn/error (default: info)

## Development Commands

```bash
npm run dev                # Start dev server with hot reload
npm run build              # Build for production
npm start                  # Start production server
npx prisma studio          # Open database GUI
npx prisma migrate dev     # Create and apply migration
npx prisma generate        # Regenerate Prisma client
```

## Testing API Endpoints

### Authentication Flow

```bash
# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password123"}'

# Login (save the token)
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token for protected routes
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Pagination Testing

```bash
# Test pagination
curl "http://localhost:4000/api/v1/users?page=2&limit=5&sortBy=name&sortOrder=asc"
```

## Troubleshooting

### "No user in current context" Error

Cause: Auth middleware not running before context middleware.

Fix: Ensure order in app.ts:
```typescript
app.use(authMiddleware);   // Must come first
app.use(contextMiddleware); // Must come second
```

### Prisma Client Not Generated

Run: `npx prisma generate`

### Database Connection Error

Check DATABASE_URL in .env and ensure database server is running.

### JWT Verification Fails

Ensure JWT_SECRET matches between token generation and verification.

## Best Practices

1. Always use BaseRepository for database operations
2. Never put business logic in repositories
3. Always use AppError for expected errors
4. Always pass `req` to service methods for logging IP and user agent
5. Use `getCurrentUserId()` instead of passing user ID through parameters
6. Log important actions using logService
7. Always validate input in controllers
8. Use pagination for all list endpoints
9. Keep environment variables in .env (never commit)
10. Use TypeScript types for all functions

## File Naming Conventions

- Controllers: `*.controller.ts`
- Services: `*.service.ts`
- Repositories: `*.repository.ts`
- Routes: `*.routes.ts`
- Types: `*.types.ts`
- Middlewares: `*.middleware.ts`
- Utils: `*.ts` (descriptive name)

## Import Paths

Use path aliases defined in tsconfig.json:
- `@/*` maps to `src/*`
- Examples: `@/config/prisma`, `@/utils/errors`, `@/modules/user/user.service`

## Security Considerations

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire after 7 days
- Rate limiting not implemented (add if needed)
- CORS not configured (add if API called from browser)
- SQL injection prevented by Prisma
- XSS protection via helmet (not included, add if needed)

## Extending the Template

To add a new feature module:
1. Create folder in `src/modules/feature-name/`
2. Create repository extending BaseRepository
3. Create service with business logic
4. Create controller with HTTP handlers
5. Create routes file
6. Import and register routes in app.ts
7. Add types to `src/types/feature-name.types.ts`
8. Update schema.prisma if adding database models
9. Run migrations
10. Test endpoints

