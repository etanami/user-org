# User Authentication & Organisation

## Overview

This project implements a backend application for user authentication and organisation management. It uses a Postgres database with ORM support using `Prisma`. The application provides endpoints for user registration, login, and organisation management, ensuring proper validation, authentication, and authorization.

## Dependencies

- Node.js
- TypeScript
- Express
- ts-node-dev
- [Other dependencies]

## Getting Started

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (Node Package Manager, included with Node.js)
- [Git](https://git-scm.com/)

## Features

- **User Registration & Login**
  - Hashes user passwords
  - Generates JWT tokens for authentication
  - Creates a default organisation for new users

- **Organisation Management**
  - Users can create and manage organisations
  - Users can view organisations they belong to or created
  - Allows adding users to organisations

## Models

### User
```
- userId: string (Unique)
- firstName: string (Required)
- lastName: string (Required)
- email: string (Unique, Required)
- password: string (Required)
- phone: string
```

### Organisation
```
- orgId: string (Unique)
- name: string (Required)
- description: string
```

## Endpoints

### Authentication

- **POST /auth/register**
  - Registers a new user and creates a default organisation.

- **POST /auth/login**
  - Logs in a user and provides a JWT token.

### User Management

- **GET /api/users/:id**
  - Retrieves a specific user details.

### Organisation Management

- **GET /api/organisations**
  - Retrieves all organisations the user belongs to or created.

- **GET /api/organisations/:orgId**
  - Retrieves a single organisation record.

- **POST /api/organisations**
  - Creates a new organisation.

- **POST /api/organisations/:orgId/users**
  - Adds a user to a specific organisation.


## Testing

### Unit Testing
- Test token generation and expiration.
- Ensure users cannot access data from organisations they don’t have access to.

### End-to-End Testing
- **It Should Register User Successfully**: Verify user registration, default organisation creation, and token issuance.
- **It Should Log the User In Successfully**: Validate login functionality.
- **It Should Fail If Required Fields Are Missing**: Ensure validation errors are returned for missing fields.
- **It Should Fail If Duplicate Email or UserID Exists**: Check for duplicate email/user ID errors.

## Directory Structure

```
|--- src
|    |--- index.ts
|--- middlewares/
|--- routes/
|--- controllers/
|--- prisma/
|--- tests/
|--- .env.local
|--- .gitignore
|--- package.json
|--- tsconfig.json
```