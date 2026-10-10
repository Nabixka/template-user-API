const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    host: process.env.DB_HOST || 'localhost'
})

module.exports = { pool }