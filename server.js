const express = require("express")
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { pool } = require("./config")

const port = process.env.APP_PORT || 3000
const app = express()

const bcrypt = require("bcrypt")

// Cors
app.use(cors())
app.use(express.json())

function generateAccessToken(id, username) {
  const token = jwt.sign(
    { id: id, username: username },
    process.env.JWT_SECRET_ACCESS,
    { expiresIn: "15m", algorithm: "HS256" },
  )

  return token
}

async function checkEmailExist(email) {
  const getUserByEmail = await pool.query(
    `
        SELECT * FROM users WHERE email =  $1`,
    [email],
  )

  return getUserByEmail.rows[0]
}

async function checkUsernameExist(username) {
  const getUserByUsername = await pool.query(
    `
        SELECT * FROM users WHERE username =  $1`,
    [username],
  )

  return getUserByUsername.rows[0]
}

// Register
app.post("/register", async (req, res) => {
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
      `
            INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username`,
      [username, email, hashPassword],
    )

    const accessToken = generateAccessToken(
      insertUser.rows[0].id,
      insertUser.rows[0].username,
    )
    const refreshToken = jwt.sign(
      { id: insertUser.rows[0].id, username: insertUser.rows[0].username },
      process.env.JWT_SECRET_REFRESH,
    )

    await pool.query(`UPDATE users SET token = $1 WHERE id = $2`, [
      refreshToken,
      insertUser.rows[0].id,
    ])

    return res.status(201).json({
      message: "Berhasil Membuat Akun",
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
      error: err.message,
    })
  }
})

// Login
app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body

    if (!name || !password) {
      return res.status(400).json({
        message: "Isi Yang Benar",
      })
    }

    const isUserExist = await pool.query(
      `
            SELECT * FROM users WHERE email = $1 OR username = $1`,
      [name],
    )
    if (isUserExist.rows.length === 0) {
      return res.status(404).json({
        message: "Akun Tidak Terdaftar",
      })
    }

    const isPassword = await bcrypt.compare(
      password,
      isUserExist.rows[0].password,
    )
    if (!isPassword) {
      return res.status(400).json({
        message: "Password Salah",
      })
    }

    const accessToken = generateAccessToken(
      isUserExist.rows[0].id,
      isUserExist.rows[0].username,
    )
    const refreshToken = jwt.sign(
      { id: isUserExist.rows[0].id, username: isUserExist.rows[0].username },
      process.env.JWT_SECRET_REFRESH,
    )

    const updateToken = await pool.query(
      `
            UPDATE users SET token = $1 WHERE username = $2 OR email = $2`,
      [refreshToken, name],
    )

    return res.json({
      message: "Berhasil Login",
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Gangguan Terhadap Server",
    })
  }
})

// Refresh Token
app.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({
        message: "Anda Belom Login",
      })
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_SECRET_REFRESH,
      async (err, user) => {
        if (err) return res.sendStatus(403)

        const result = await pool.query(
          `SELECT * FROM users WHERE id = $1 AND token = $2`,
          [user.id, refreshToken],
        )
        if (result.rows.length === 0) {
          return res
            .status(403)
            .json({ message: "Refresh Token Tidak Valid atau Sudah Logout" })
        }

        const accessToken = generateAccessToken(user.id, user.username)

        res.json({
          message: "Berhasil Refresh TOken",
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
    const { refreshToken } = req.body

    const deleteToken = await pool.query(
      `
            UPDATE users SET token = $1 WHERE token = $2`,
      [null, refreshToken],
    )

    res.sendStatus(204)
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
