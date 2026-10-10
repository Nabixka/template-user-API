const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const crypto = require("crypto")
const cookieParser = require("cookie-parser")
const { pool } = require("./config")
const { rateLimit } = require("express-rate-limit")

const port = process.env.APP_PORT || 3000
const app = express()

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { message: "Too Many Requests" }
})

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ["POST", "DELETE"],
    credentials: true
}))
app.use(helmet())
app.use(express.json())
app.use(cookieParser())

function generateAccessToken(id, username) {
  const token = jwt.sign(
    { id: id, username: username },
    process.env.JWT_SECRET_ACCESS,
    { expiresIn: "15m", algorithm: "HS256" },
  )

  return token
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

async function checkEmailExist(email) {
  const getUserByEmail = await pool.query(
    `SELECT * FROM users WHERE email = $1`,
    [email],
  )
  return getUserByEmail.rows[0]
}

async function checkUsernameExist(username) {
  const getUserByUsername = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username],
  )
  return getUserByUsername.rows[0]
}

// Register
app.post("/register", limiter, async (req, res) => {
  try {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Isi Yang Benar",
      })
    }

    const isEmailExist = await checkEmailExist(email)
    if (isEmailExist) {
      return res.status(409).json({
        message: "Email Sudah Terdaftar",
      })
    }

    const isUsernameExist = await checkUsernameExist(username)
    if (isUsernameExist) {
      return res.status(409).json({
        message: "Username Sudah Terdaftar",
      })
    }

    const hashPassword = await bcrypt.hash(password, 10)

    const insertUser = await pool.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username`,
      [username, email, hashPassword],
    )

    const userId = insertUser.rows[0].id
    const userUsername = insertUser.rows[0].username

    const accessToken = generateAccessToken(userId, userUsername)
    const refreshToken = jwt.sign(
      { id: userId, username: userUsername },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: "7d" }
    )

    const hashedRefreshToken = hashToken(refreshToken)

    await pool.query(`UPDATE users SET token = $1 WHERE id = $2`, [
      hashedRefreshToken,
      userId,
    ])

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    })

    return res.status(201).json({
      message: "Berhasil Membuat Akun",
      access_token: accessToken,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
      error: err.message,
    })
  }
})

// Login
app.post("/login", limiter, async (req, res) => {
  try {
    const { name, password } = req.body

    if (!name || !password) {
      return res.status(400).json({
        message: "Isi Yang Benar",
      })
    }

    const isUserExist = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR username = $1`,
      [name],
    )
    if (isUserExist.rows.length === 0) {
      return res.status(404).json({
        message: "Akun Tidak Terdaftar",
      })
    }

    const user = isUserExist.rows[0]
    const isPassword = await bcrypt.compare(password, user.password)
    if (!isPassword) {
      return res.status(400).json({
        message: "Password Salah",
      })
    }

    const accessToken = generateAccessToken(user.id, user.username)
    const refreshToken = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET_REFRESH,
      { expiresIn: "7d" }
    )

    const hashedRefreshToken = hashToken(refreshToken)

    await pool.query(
      `UPDATE users SET token = $1 WHERE id = $2`,
      [hashedRefreshToken, user.id],
    )

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.json({
      message: "Berhasil Login",
      access_token: accessToken,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
      error: err.message,
    })
  }
})

// Refresh Token
app.post("/refresh-token", limiter, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
      return res.status(401).json({
        message: "Anda Belum Login",
      })
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH,
      async (err, user) => {
        if (err) return res.sendStatus(403)

        const hashedRefreshToken = hashToken(refreshToken)

        const result = await pool.query(
          `SELECT * FROM users WHERE id = $1 AND token = $2`,
          [user.id, hashedRefreshToken],
        )
        if (result.rows.length === 0) {
          return res
            .status(403)
            .json({ message: "Refresh Token Tidak Valid atau Sudah Logout" })
        }

        const accessToken = generateAccessToken(user.id, user.username)

        res.json({
          message: "Berhasil Refresh Token",
          access_token: accessToken,
        })
      },
    )
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
      error: err.message,
    })
  }
})

// Endpoint Logout
app.delete("/logout", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {
      const hashedRefreshToken = hashToken(refreshToken)
      await pool.query(
        `UPDATE users SET token = $1 WHERE token = $2`,
        [null, hashedRefreshToken],
      )
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    })

    return res.sendStatus(204)
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
      error: err.message,
    })
  }
})

app.listen(port, () => {
  console.log(`Application Success & Listen on Port ${port}`)
})