# Booking API

A RESTful booking management API built using **NestJS**, **TypeScript**, **PostgreSQL**, and **Prisma ORM**.

The system allows users to authenticate, manage services, and create/manage bookings with proper validation, business rules, and error handling.

---

# Project Overview

This project is a backend API for a booking platform.

Main features:

- User registration and authentication
- JWT access token authentication
- Refresh token support
- Service management
- Booking creation and management
- Booking status management
- Duplicate booking prevention
- Request validation
- Global exception handling
- Database migrations using Prisma
- Docker support
- Swagger API documentation

---

# Tech Stack

- **Backend:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **API Documentation:** Swagger
- **Testing:** Jest
- **Containerization:** Docker

---

# Project Structure

```
src
├── auth              # Authentication module
├── users             # User management
├── services          # Service management
├── bookings          # Booking management
├── common
│   └── filters       # Global exception handling
├── prisma            # Prisma configuration
└── main.ts           # Application entry point

prisma
└── migrations        # Database migration files
```

---

# Installation Steps

## 1. Clone Repository

```bash
git clone <repository-url>
cd BookingApp
```

## 2. Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Example:

```env
PORT=3000

DATABASE_URL="postgresql://username:password@localhost:5432/booking_platform"

JWT_SECRET="your_jwt_secret"
JWT_EXPIRATION="1d"

REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ACCESS_TOKEN_EXPIRATION="15m"
REFRESH_TOKEN_EXPIRATION="7d"
```

A sample environment file is provided:

```
.env.example
```

---

# Database Setup

## PostgreSQL

Create a PostgreSQL database and update the `DATABASE_URL` value.

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/booking_platform"
```

---

# Running Database Migrations

Generate Prisma client:

```bash
npx prisma generate
```

Apply database migrations:

```bash
npx prisma migrate deploy
```

Migration files are available in:

```
prisma/migrations
```

---

# Running the Application

## Development Mode

```bash
npm run start:dev
```

The API will run on:

```
http://localhost:3000
```

---

## Production Build

Build:

```bash
npm run build
```

Run:

```bash
npm run start:prod
```

---

# Docker Support

The project includes Docker configuration.

Start the application with:

```bash
docker compose up --build
```

Docker will start:

- NestJS API container
- PostgreSQL database container

---

# API Documentation

Swagger documentation is available after starting the application:

```
http://localhost:3000/api/docs
```

The API documentation includes:

- Authentication endpoints
- Service endpoints
- Booking endpoints

---

# API Modules

## Authentication

Features:

- Register user
- Login user
- Refresh access tokens
- Logout user
- Get authenticated user

---

## Services

Features:

- Create service
- View services
- View service details
- Update service
- Delete service

---

## Bookings

Features:

- Create booking
- View bookings
- View booking details
- Update booking status
- Delete booking

---

# Testing

Run all tests:

```bash
npm test
```

Implemented test coverage includes:

- Authentication service tests
- Service management tests
- Booking business rule tests
- Global exception filter tests

Current test result:

```
Test Suites: 5 passed
Tests: 22 passed
```

---

# Assumptions Made

- Email addresses are unique identifiers for users.
- Customers can create bookings without authentication.
- Service management requires authentication.
- A service cannot have multiple bookings for the same date and time slot.
- Cancelled bookings cannot be marked as completed.
- Refresh tokens are stored securely using hashing.

---

# Future Improvements

Possible improvements:

- Role-based access control
- Email/SMS booking notifications
- Payment integration
- Calendar synchronization
- API rate limiting
- CI/CD pipeline integration
- Cloud deployment
- Monitoring and logging improvements

---

# Additional Notes

The project follows NestJS best practices including:

- Modular architecture
- Dependency injection
- DTO validation
- Service-layer business logic
- Prisma-based database access
- Centralized exception handling