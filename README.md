# CENCO-MIT-Back-T1

## Project Overview 📍

This project is the backend for the User Management Platform developed for TalentAlke. The goal is to build a robust and secure backend system using NestJS to handle user management, including registration, authentication, and data management. The system uses TypeORM to interact with a MySQL database and implements JWT-based authentication.

## Dependencies & Justifications 🛠️

### Mandatory Libraries

- **`@nestjs/platform-express`**: Provides integration with the Express framework for handling HTTP requests.
- **`@nestjs/typeorm`**: TypeORM integration for managing the database connections and operations.
- **`typeorm`**: ORM library for TypeScript and JavaScript to interact with the MySQL database.
- **`bcrypt`**: For hashing passwords securely.
- **`jsonwebtoken`**: For generating and verifying JSON Web Tokens (JWT) for authentication.
- **`class-transformer`** and **`class-validator`**: For transforming and validating data transfer objects (DTOs).
- **`winston`**: For logging with support for different transports and log levels.
