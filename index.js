const express = require('express')
const app = express()
const PORT = 2025
const cors = require('cors')
const bearerToken = require('express-bearer-token')

app.use(cors())
app.use(bearerToken()) // untuk mengmbil data authorization atau token dari req header yg dikirim oleh front end
app.use(express.json()) //untuk menangkap data dari request body URL

app.use(express.static('public')) // untuk memberikan akses langsung ke direktori


const { db } = require('./config/database')

db.getConnection((err, connection) => {
    if (err) {
        return console.error('Error MySQL', err.message)
    }
    console.log(`Connected to MySQL Server: ${connection.threadId}`)
})


app.get('/', (req, res) => {
    res.status(200).send('<h1>Welcome to, Ikea API</h1>')
})

const { productRouter } = require('./routers')
const { userRouter } = require('./routers')
const { transactionRouter } = require('./routers')
app.use('/products', productRouter)
app.use('/users', userRouter)
app.use('/transaction', transactionRouter)

// ERROR HANDLING
app.use((error, req, res, next) => {
    console.log("Handling Error", error)
    res.status(500).send({ status: 'Error Mysql', message: error })
})

app.listen(PORT, () => console.log("Server Running:", PORT))