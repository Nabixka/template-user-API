# Template User API

A user authentication API template built with Node.js, Express.js, PostgreSQL, JWT, and bcrypt.

## Features

- User registration
- Login using email or username
- Password hashing with bcrypt
- JSON Web Token (JWT) authentication
- Refresh token support to renew access tokens
- Logout by invalidating the active refresh token
- Basic input validation and duplicate email/username checks

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
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
└── node_modules/
```

## Requirements

Before running the project, make sure you have:

- Node.js v18+
- PostgreSQL database
- Environment variables configured properly

## Setup

1. Clone or download this project.
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

4. Set the values in the `.env` file:

```env
DB_NAME=your_database_name
DB_PASS=your_password
DB_HOST=localhost
DB_USER=your_db_user

JWT_SECRET_ACCESS=your_access_secret
JWT_SECRET_REFRESH=your_refresh_secret
```

## Database Migration

This project includes a migration script to create the `users` table.

```bash
node migrate.js
```

## Run the Server

```bash
node server.js
```

The server runs on port `3000` by default, or it can be changed using the `APP_PORT` environment variable.

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new user |
| POST | `/login` | Log in with email/username and password |
| POST | `/refresh-token` | Refresh the access token using the refresh token |
| DELETE | `/logout` | Log out by invalidating the refresh token |

## Example Requests

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

### Login

```http
POST /login
Content-Type: application/json

{
  "name": "john@example.com",
  "password": "secret123"
}
```

### Refresh Token

```http
POST /refresh-token
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

### Logout

```http
DELETE /logout
Content-Type: application/json

{
  "refreshToken": "your_refresh_token_here"
}
```

## Success Response

Example response from the register/login endpoints:

```json
{
  "message": "Login Successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Notes

- Make sure `JWT_SECRET_ACCESS` and `JWT_SECRET_REFRESH` are always different and secure.
- The PostgreSQL database must be running before starting the server.
- For production use, it is recommended to add stronger validation, better authentication middleware, rate limiting, and more robust error handling.

## License

This project is created as a user API template and can be modified according to your needs.
