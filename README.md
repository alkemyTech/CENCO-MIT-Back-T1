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

## .env File

```
PORT=3306
DATABASE="name_database"
USERNAMEDB="root"
PASSWORD="123456"
HOST="localhost"
JWT_SECRET=ead643ce042680b8acf42e5f9e8463318cc63bcd8a51cd40ee9cf1444b718a029e8e342f7083042db0742d8f244af94f8aac2c909a6f73d00060d1b5f5fb40f8
DEFAULT_ADMIN_NAME=Admin
DEFAULT_ADMIN_RUT=11.111.111-1
DEFAULT_ADMIN_EMAIL=admin@admin.cl
DEFAULT_ADMIN_PASSWORD=Password

# Rate Limit Configuration
RATE_LIMIT_LOGIN_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_LOGIN_MAX_REQUESTS=5  # 5 intentos
RATE_LIMIT_SIGNUP_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_SIGNUP_MAX_REQUESTS=10  # 10 solicitudes
RATE_LIMIT_GENERAL_WINDOW_MS=60000  # 1 minuto
RATE_LIMIT_GENERAL_MAX_REQUESTS=100  # 100 solicitudes
```

## API Postman Collection

```
{
  "info": {
    "name": "User API",
    "description": "API for managing users including signup, login, and administrative actions.",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Signup",
      "request": {
        "method": "POST",
        "url": {
          "raw": "http://localhost:3000/user/signup",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "signup"]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ],
        "body": {
          "mode": "json",
          "json": {
            "name": "string",
            "rut": "string",
            "email": "string",
            "password": "string",
            "role": "enum (USER, ADMIN)",
            "phone": "string",
            "birthday": "date",
            "country": "string"
          }
        }
      }
    },
    {
      "name": "Login",
      "request": {
        "method": "POST",
        "url": {
          "raw": "http://localhost:3000/user/login",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "login"]
        },
        "body": {
          "mode": "json",
          "json": {
            "email": "string",
            "password": "string"
          }
        }
      }
    },
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/user/profile",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "profile"]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ]
      }
    },
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/user/all",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "all"]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ]
      }
    },
    {
      "name": "Update User",
      "request": {
        "method": "PATCH",
        "url": {
          "raw": "http://localhost:3000/user/update?rut={rut}",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "update"],
          "query": [
            {
              "key": "rut",
              "value": "string"
            }
          ]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ],
        "body": {
          "mode": "json",
          "json": {
            "name": "string",
            "email": "string",
          }
        }
      }
    },
    {
      "name": "Delete User",
      "request": {
        "method": "DELETE",
        "url": {
          "raw": "http://localhost:3000/user/delete/:id",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "delete", ":id"]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ]
      }
    },
    {
      "name": "Search Users",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/user/search?query={query}",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["user", "search"],
          "query": [
            {
              "key": "query",
              "value": "string"
            }
          ]
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer <token>",
            "type": "text"
          }
        ]
      }
    }
  ]
}

```
