# Template User API

Template API untuk autentikasi user menggunakan Node.js, Express.js, PostgreSQL, JWT, dan bcrypt.

## Fitur

- Registrasi user baru
- Login menggunakan email atau username
- Password hashing dengan bcrypt
- JSON Web Token (JWT) untuk autentikasi
- Refresh token untuk memperbarui access token
- Logout dengan menghapus token aktif
- Validasi dasar input dan pengecekan duplikasi email/username

## Tech Stack
    
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt
- dotenv

## Struktur Project

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

## Persyaratan

Sebelum menjalankan project, pastikan Anda sudah menyiapkan:

- Node.js v18+
- PostgreSQL database
- Environment variable yang sudah diatur

## Setup

1. Clone atau unduh project ini.
2. Install dependency:

```bash
npm install
```

3. Buat file `.env` berdasarkan `.env.example`:

```bash
cp .env.example .env
```

4. Atur nilai variabel di file `.env`:

```env
DB_NAME=your_database_name
DB_PASS=your_password
DB_HOST=localhost
DB_USER=your_db_user

JWT_SECRET_ACCESS=your_access_secret
JWT_SECRET_REFRESH=your_refresh_secret
```

## Migrasi Database

Project ini memiliki script migrasi untuk membuat tabel `users`.

```bash
node migrate.js
```

## Menjalankan Server

```bash
node server.js
```

Server akan berjalan di port `3000` secara default, atau bisa diubah melalui variabel `APP_PORT`.

## Endpoint API

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/register` | Mendaftarkan user baru |
| POST | `/login` | Login user dengan email/username dan password |
| POST | `/refresh-token` | Memperbarui access token menggunakan refresh token |
| DELETE | `/logout` | Logout dengan menghapus refresh token |

## Contoh Request

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

## Response Sukses

Contoh response dari endpoint register/login:

```json
{
  "message": "Berhasil Login",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Catatan

- Pastikan `JWT_SECRET_ACCESS` dan `JWT_SECRET_REFRESH` selalu berbeda dan aman.
- Database PostgreSQL harus aktif sebelum menjalankan server.
- Untuk kebutuhan produksi, disarankan menambahkan validasi lebih lanjut seperti middleware autentikasi yang lebih aman, rate limiting, dan error handling yang lebih ketat.

## Lisensi

Project ini dibuat sebagai template API user dan dapat dimodifikasi sesuai kebutuhan.
