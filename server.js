const express = require('express')
const jwt = require("jsonwebtoken")
const port = process.env.APP_PORT || 3000
const app = express()

const bcrypt = require("bcrypt")

// Cors
app.use(cors())

function jwtHelper(id, username){
    const token = jwt.sign({ id: id, username: username}, process.env.JWT_SECRET, { algorithm: 'RS256'})

    return token
}

async function userExist(name){
    const getUser = await pool.query(`
        SELECT * FROM users WHERE email = $1 OR username = $1`,
    [name])

    return getUser.rows[0]
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

        const hashPassword = await bcrypt.hash(password, 10)

        const isExist = await userExist(email)
        if(isExist){
            return res.status(409).json({
                message: "User Dengan"
            })
        }

        const [insertUser] = await pool.query(`
            INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username`,
        [username, email, hashPassword])

        // const token = jwtHelper(insertUser.id, insertUser.username)

        console.log(insertUser)

        return res.status(201).json({
            message: "Berhasil Membuat Akun",
            // token: token
        })
    }
    catch(err){
        return res.status(500).json({
            message: "Gangguan Terhadap Server",
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

        const isExist = await userExist(name)
        if(!isExist){
            return res.status(409).json({
                message: "User Dengan Email Atau Username Sudah Terdaftar"
            })
        }

        const isPassword = await bcrypt.compare(password, isExist.password)
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