# Outmanazizi Server

A NestJS-based backend server with PostgreSQL database integration, JWT authentication, and Swagger API documentation.

## Features

- **NestJS Framework**: Modern Node.js framework for building efficient server-side applications
- **PostgreSQL Database**: Robust relational database with Prisma ORM
- **JWT Authentication**: Secure token-based authentication with Passport
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **TypeScript**: Full TypeScript support for type safety
- **Testing**: Comprehensive test setup with Jest
- **Code Quality**: ESLint and Prettier for code formatting and linting

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn**
- **PostgreSQL** database

## Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd outmanazizi-server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure the following variables:

   ```env
   # Database Configuration
   DATABASE_URL="database_url"

   # Server Configuration
   PORT=3000

   # JWT Configuration
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_EXPIRES_IN="7d"

   # Node Environment
   NODE_ENV="development"
   ```

4. **Set up the database:**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations (when you have migrations)
   npx prisma migrate dev

   # Or push schema to database (for development)
   npx prisma db push
   ```

## Environment Variables

| Variable         | Description                      | Required | Default     |
| ---------------- | -------------------------------- | -------- | ----------- |
| `DATABASE_URL`   | PostgreSQL connection string     | Yes      | -           |
| `PORT`           | Port number for the server       | No       | 3000        |
| `JWT_SECRET`     | Secret key for JWT token signing | Yes      | -           |
| `JWT_EXPIRES_IN` | JWT token expiration time        | No       | 7d          |
| `NODE_ENV`       | Node.js environment              | No       | development |

## Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Debug Mode

```bash
npm run start:debug
```

Starts the server in debug mode with debugging enabled.

### Production Mode

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

## API Documentation

Once the server is running, you can access the Swagger API documentation at:

```
http://localhost:3000/docs
```

The API documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Interactive API testing interface

## Database Management

### Prisma Commands

```bash
# Generate Prisma client after schema changes
npx prisma generate

# View your database in Prisma Studio
npx prisma studio

# Reset database (caution: this will delete all data)
npx prisma migrate reset

# Deploy migrations to production
npx prisma migrate deploy
```

## Testing

```bash
# Unit tests
npm run test

# Unit tests in watch mode
npm run test:watch

# Test coverage
npm run test:cov

# End-to-end tests
npm run test:e2e

# Debug tests
npm run test:debug
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format
```

## Project Structure

```
src/
├── app.controller.ts     # Main application controller
├── app.module.ts         # Root application module
├── app.service.ts        # Main application service
└── main.ts              # Application entry point

prisma/
└── schema.prisma        # Database schema definition

test/
├── app.e2e-spec.ts      # End-to-end tests
└── jest-e2e.json        # E2E test configuration
```

## Development Workflow

1. **Make changes** to your code
2. **Run tests** to ensure everything works: `npm run test`
3. **Lint and format** your code: `npm run lint && npm run format`
4. **Update database schema** if needed in `prisma/schema.prisma`
5. **Generate Prisma client**: `npx prisma generate`
6. **Run migrations** or push schema: `npx prisma db push`

## Authentication

This project uses JWT (JSON Web Tokens) for authentication. The API endpoints are protected with Bearer token authentication.

To authenticate:

1. Obtain a JWT token from the login endpoint
2. Include the token in the Authorization header: `Bearer <your-token>`

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in your `.env` file
- Check that the database exists and is accessible

### Port Already in Use

- Change the `PORT` in your `.env` file
- Or kill the process using the port: `netstat -ano | findstr :3000` (Windows)

### Prisma Issues

- Run `npx prisma generate` after schema changes
- Clear Prisma cache: `npx prisma generate --force`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Run tests and linting
5. Commit your changes: `git commit -m 'Add some feature'`
6. Push to the branch: `git push origin feature/your-feature-name`
7. Submit a pull request

## License

This project is licensed under the UNLICENSED License.

/media/shariar/e254242e-35fc-4d3e-8d94-fb6a42200cb8/outmanazizi-server/
├─] .env (ignored)
├── .env.example
├── .gitignore
├── .prettierrc
├── README.md
├─] dist/ (ignored)
├── docker-compose.yml
├── eslint.config.mjs
├── extensions.txt
├── nest-cli.json
├─] node_modules/ (ignored)
├── package-lock.json
├── package.json
├── packages.microsoft.gpg
├── prisma/
│ ├── migrations/
│ │ ├── 20251015194502_new/
│ │ │ └── migration.sql
│ │ ├── 20251015194803_new/
│ │ │ └── migration.sql
│ │ ├── 20251015213016_a/
│ │ │ └── migration.sql
│ │ ├── 20251015213225_new_migration/
│ │ │ └── migration.sql
│ │ ├── 20251018184145_add_simple_chat_system/
│ │ │ └── migration.sql
│ │ └── migration_lock.toml
│ ├── models/
│ │ ├── AreaAndServices.prisma
│ │ ├── Bid.prisma
│ │ ├── Message.prisma
│ │ ├── NoteService.prisma
│ │ ├── Review.prisma
│ │ ├── Service.prisma
│ │ ├── ServiceProvider.prisma
│ │ ├── User.prisma
│ │ └── schema.prisma
│ └── schema.prisma
├── prisma.config.ts
├── public/
│ └── uploads/
│ └── chat/
├── scripts/
│ └── compose-prisma-schema.mjs
├── settings.json
├── src/
│ ├── app.controller.ts
│ ├── app.module.ts
│ ├── guards/
│ │ ├── auth.guard.ts
│ │ ├── public.decorator.ts
│ │ ├── role.guard.ts
│ │ └── roles.decorator.ts
│ ├── main/
│ │ ├── admin/
│ │ │ ├── admin.controller.ts
│ │ │ ├── admin.module.ts
│ │ │ ├── admin.service.ts
│ │ │ ├── area-andservices/
│ │ │ │ └── area-andservices.service.ts
│ │ │ └── dto/
│ │ │ └── areaAndServices.dto.ts
│ │ ├── auth/
│ │ │ ├── auth.controller.ts
│ │ │ ├── auth.module.ts
│ │ │ ├── auth.service.ts
│ │ │ ├── dto/
│ │ │ │ ├── auth-response.dto.ts
│ │ │ │ ├── changePassword.dto.ts
│ │ │ │ ├── emailAndOtp.dto.ts
│ │ │ │ ├── index.ts
│ │ │ │ ├── login.dto.ts
│ │ │ │ ├── register.dto.ts
│ │ │ │ ├── resetPassword.ts
│ │ │ │ ├── updateUser.dto.ts
│ │ │ │ └── uploadImage.dto.ts
│ │ │ ├── role.enum.ts
│ │ │ └── strategy/
│ │ │ ├── facebook.strategy.ts
│ │ │ └── goggle.strategy.ts
│ │ ├── consumer/
│ │ │ ├── consumer.controller.ts
│ │ │ ├── consumer.module.ts
│ │ │ ├── consumer.service.ts
│ │ │ └── dto/
│ │ │ ├── create-consumer.dto.ts
│ │ │ ├── sendReview.dto.ts
│ │ │ └── update-consumer.dto.ts
│ │ ├── job/
│ │ │ ├── dto/
│ │ │ │ ├── create-job.dto.ts
│ │ │ │ └── update-job.dto.ts
│ │ │ ├── job.controller.ts
│ │ │ ├── job.module.ts
│ │ │ └── job.service.ts
│ │ ├── payment/
│ │ │ ├── dto/
│ │ │ │ └── create-payment.dto.ts
│ │ │ ├── payment.controller.ts
│ │ │ ├── payment.module.ts
│ │ │ └── payment.service.ts
│ │ ├── service-provider/
│ │ │ ├── dto/
│ │ │ │ ├── create-service-provider.dto.ts
│ │ │ │ ├── service-provider-bid.dto.ts
│ │ │ │ └── uploadDocuments.dto.ts
│ │ │ ├── service-provider.controller.ts
│ │ │ ├── service-provider.module.ts
│ │ │ └── service-provider.service.ts
│ │ └── stripe/
│ │ ├── dto/
│ │ │ ├── create-stripe.dto.ts
│ │ │ └── update-stripe.dto.ts
│ │ ├── stripe.controller.ts
│ │ ├── stripe.module.ts
│ │ └── stripe.service.ts
│ ├── main.ts
│ ├── messages/
│ │ ├── dto/
│ │ │ ├── create-conversation-simple.dto.ts
│ │ │ ├── create-message.dto.ts
│ │ │ ├── get-messages-simple.dto.ts
│ │ │ ├── get-messages.dto.ts
│ │ │ ├── send-message-simple.dto.ts
│ │ │ ├── send-message.dto.ts
│ │ │ └── upload-file-simple.dto.ts
│ │ ├── messages.controller.ts
│ │ ├── messages.gateway.ts
│ │ ├── messages.module.ts
│ │ └── messages.service.ts
│ ├── prisma/
│ │ ├── prisma.module.ts
│ │ └── prisma.service.ts
│ └── utils/
│ ├── common/
│ │ ├── all-exception/
│ │ │ └── all-exception-filter.ts
│ │ ├── apiresponse/
│ │ │ └── apiresponse.ts
│ │ ├── enum/
│ │ │ └── userEnum.ts
│ │ ├── file/
│ │ │ └── fileUploads.ts
│ │ └── localtimeAndDate/
│ │ └── localtime.ts
│ ├── helper/
│ │ ├── helper.module.ts
│ │ └── helper.service.ts
│ ├── mail/
│ │ ├── mail.module.ts
│ │ ├── mail.service.ts
│ │ └── templates/
│ │ └── contact-seller.template.ts
│ └── seed/
│ └── seed.ts
├── test/
│ ├── app.e2e-spec.ts
│ └── jest-e2e.json
├── tsconfig.build.json
└── tsconfig.json
