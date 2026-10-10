# Template User API

This project is a simple authentication API template built with Node.js and Express.js. It includes user registration, login, JWT-based access tokens, refresh-token rotation, and logout flow using PostgreSQL.

## Features

- User registration
- Login with email or username
- Password hashing with bcrypt
- JWT access token generation
- Refresh token support via cookies
- Logout by clearing the refresh token from the database and cookie
- Duplicate validation for email and username
- Rate limiting for public endpoints
- Security headers with Helmet
- CORS configuration

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- pg (PostgreSQL client)
- JWT
- bcrypt
- cookie-parser
- Helmet
- CORS
- express-rate-limit
- dotenv

## Project Structure

```bash
.
├── .env.example
├── .env
├── config.js
├── migrate.js
├── package.json
├── readme.md
├── server.js
├── node_modules/
└── package-lock.json
```

## Requirements

Before running the project, make sure you have:

- Node.js v18 or newer
- PostgreSQL server running
- A database created for the app
- Environment variables configured in `.env`

## Installation

1. Clone/download this project.
2. Install dependencies:

```bash
npm install
```

3. Copy the example environment file:

```bash
cp .env.example .env
```

4. Fill in the required values in `.env`:

```env
DB_NAME=your_database_name
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user

JWT_SECRET_ACCESS=your_access_secret
JWT_SECRET_REFRESH=your_refresh_secret

CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

## Database Setup

This project expects a `users` table in PostgreSQL. Run the migration script to create it:

```bash
node migrate.js
```

## Run the Server

```bash
node server.js
```

By default, the app runs on port `3000`. You can override it with the `APP_PORT` environment variable.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new user account |
| POST | `/login` | Log in with `name` (email or username) and password |
| POST | `/refresh-token` | Generate a new access token using the refresh token cookie |
| DELETE | `/logout` | Invalidate the current refresh token and clear the cookie |

## Request Examples

### Register

```http
POST /register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

Example response:

```json
{
  "message": "Berhasil Membuat Akun",
  "access_token": "<jwt_access_token>"
}
```

### Login

```http
POST /login
Content-Type: application/json

{
  "name": "john@example.com",
  "password": "secret123"
}
```

The `name` field accepts either the user's email or username.

Example response:

```json
{
  "message": "Berhasil Login",
  "access_token": "<jwt_access_token>"
}
```

### Refresh Token

This endpoint reads the refresh token from the `refreshToken` cookie.

```http
POST /refresh-token
```

Example response:

```json
{
  "message": "Berhasil Refresh Token",
  "access_token": "<new_jwt_access_token>"
}
```

### Logout

```http
DELETE /logout
```

This clears the refresh token from the database and removes the cookie from the client.

## Notes

- `JWT_SECRET_ACCESS` and `JWT_SECRET_REFRESH` should be unique and strong.
- The PostgreSQL database must be running before starting the app.
- The refresh token is stored in an HTTP-only cookie and is hashed before saving to the database.
- This project is intentionally a template and can be extended for production use with extra validation, middleware, and monitoring.

## License

This project is a starter template for a user authentication API and can be modified according to your needs.
