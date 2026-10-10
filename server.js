const express = require('express')
const cors = require("cors")
const jwt = require("jsonwebtoken")
const { pool } = require("./config")

const port = process.env.APP_PORT || 3000
const app = express()

const bcrypt = require("bcrypt")

// Cors
app.use(cors())
app.use(express.json())

function jwtHelper(id, username){
    const token = jwt.sign(
        { id: id, username: username}, 
        process.env.JWT_SECRET, 
        { expiresIn: "30d", algorithm: 'HS256'}
    )

    return token
}

async function checkEmailExist(email){
    const getUserByEmail = await pool.query(`
        SELECT * FROM users WHERE email =  $1`
    , [email])

    return getUserByEmail.rows[0]
}

async function checkUsernameExist(username){
    const getUserByUsername = await pool.query(`
        SELECT * FROM users WHERE username =  $1`
    , [username])

    return getUserByUsername.rows[0]
}

// Register
app.post('/register', async (req, res) => {
    try{
        const { username, email, password } = req.body
        
        if(!username || !email || !password){
            return res.status(400).json({
                message: "Isi Yang Benar"
            })
        }

        const isEmailExist = await checkEmailExist(email)
        if(isEmailExist){
            return res.status(409).json({
                message: "Email Sudah Terdaftar"
            })
        }

        const isUsernameExist = await checkUsernameExist(username)
        if(isUsernameExist){
            return res.status(409).json({
                message: "Username Sudah Terdaftar"
            })
        }

        const hashPassword = await bcrypt.hash(password, 10)

        const insertUser = await pool.query(`
            INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username`,
        [username, email, hashPassword])

        const token = jwtHelper(insertUser.rows[0].id, insertUser.rows[0].username)

        return res.status(201).json({
            message: "Berhasil Membuat Akun",
            token: token
        })
    }
    catch(err){
        return res.status(500).json({
            message: "Gangguan Terhadap Server",
            error: err.message,
            stack: err.stack  
        })
    }
})

// Login
app.post('/login', async (req, res) => {
    try{
        const { name, password} = req.body

        if(!name || !password){
            return res.status(400).json({
                message: "Isi Yang Benar"
            })
        }

        const isUserExist = await pool.query(`
            SELECT * FROM users WHERE email = $1 OR username = $1`, [name])
        if(!isUserExist){
            return res.status(404).json({
                message: "Akun Tidak Terdaftar"
            })
        }

        const isPassword = await bcrypt.compare(password, isUserExist.rows[0].password)
        if(!isPassword){
            return res.status(400).json({
                message: "Password Salah"
            })
        }

        const token = jwtHelper(isUserExist.rows[0].id, isUserExist.rows[0].username)

        return {
            message: "Berhasil Login",
            token: token
        }

    }
    catch(err){
        return res.status(500).json({
            message: "Gangguan Terhadap Server",
            stack: err.stack  
        })
    }
})


app.listen(port, () => {
    console.log(`Application Success & Listen on Port ${port}`)
})