const mysql = require('mysql')
const util = require('util')

const db = mysql.createPool({
    host: 'localhost',
    user: 'slthnsf',
    password: 'tamaninduk44',
    database: 'db_ikea',
    port: 3306,
    multipleStatements: true
})

const dbQuery = util.promisify(db.query).bind(db)

// db.getConnection((err, connection) => {
//     if(err){
//         return console.error('Error MySQL', err.message)
//     }
//     console.log(`Connected to MySQL Server: ${connection.threadId}`)
// })

module.exports={ db, dbQuery }