const mongoose = require('mongoose')

const enterpriseSaleContactSchema = new mongoose.Schema({
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

const enterpriseSaleContacts = mongoose.model("enterprise_sale_contacts", enterpriseSaleContactSchema)
module.exports = enterpriseSaleContacts