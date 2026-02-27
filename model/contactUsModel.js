const mongoose = require('mongoose')

const contactUsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    }
})

const contactUsRequests = mongoose.model("contact_us_requests", contactUsSchema)
module.exports = contactUsRequests