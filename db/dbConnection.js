require('dotenv').config();
const mongoose = require('mongoose')

const dbConnectionString = process.env.DB_CONNECTION_STRING?.trim()

function connectToDB() {
    console.log("Attempting to connect to: ", dbConnectionString ? "String found" : "String MISSING");
    mongoose.connect(dbConnectionString)
        .then((res) => {
            console.log('connected to MongoDB atlas')
        })
        .catch((err) => {
            console.log(`MongoDB Error: ${err}`)
        })
}

module.exports = connectToDB