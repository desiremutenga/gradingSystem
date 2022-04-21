const mysql = require('mysql');
const dotenv = require('dotenv').config();


const db = mysql.createConnection({

    host:process.env.HOST,
    database:process.env.DATABASE_NAME,
    user:process.env.USER,
    password:process.env.PASSWORD
});


//connect
db.connect((error)=>{
    if(error) throw error


    console.log('DB CONNECTED');

})


module.exports = db;