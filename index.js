require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectToDB = require('./db/dbConnection')
const router = require('./routes/route')

// connect to database
connectToDB()

// create server
const btServer = express()

// enable permissions
btServer.use(cors({ origin: true, credentials: true }))

// middlewares
btServer.use(express.json())

// routes
btServer.use(router)

// port number
const PORT = process.env.PORT || 3000

// start server
btServer.listen(PORT, () => {
    console.log(`server running @ ${PORT}`)
})