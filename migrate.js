const { pool } = require("./config")

async function migrate(){
    try{
        await pool.query(`
            CREATE TABLE users(
            id SERIAL PRIMARY KEY,
            username VARCHAR UNIQUE,
            email VARCHAR UNIQUE,
            password TEXT
            )
        `)

        console.log("Berhasil Membuat User")
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