const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema({
    name : {
        type : String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    avatar: {
        type: String
    },
    review: {
        type: String,
        required: true
    },
    approved: {
        type: String,
        enum: ['Approved', 'Pending'],
        default: 'Pending',
        required: true
    }
})

const testimonials = mongoose.model("testimonials", testimonialSchema)
module.exports = testimonials