const { pool } = require("./config")

async function migrate(){
    try{
        await pool.query(`
            CREATE TABLE users IF NOT EXISTS(
            id SERIAL PRIMARY KEY
            username VARCHAR UNIQUE
            email VARCHAR UNIQUE
            password TEXT
            )
        `)
    }
    catch(err){
        console.log("Gagal Migrate")
        console.log(`err`, err.message)
        console.log(`stack`, err.stack)
    }
    finally{
        process.exit(0)
    }
}

migrate()