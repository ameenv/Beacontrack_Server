const mongoose = require('mongoose')

const ticketSchema = new mongoose.Schema(
    {
        deviceId: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "resolved", "rejected"], // restricts values
            default: "resolved"
        }
    },
    { _id: false } // disables _id for each ticket
);

// user model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    ticket: [ ticketSchema ],
    userPlan: {
        type: String,
        enum: ['basic', 'standard', 'enterprise'],
        default: 'basic'
    },
    deviceLimit: {
        type: Number,
        // required: true
    },
    orderId: {
        type: String,
        // required: true
    },
    paymentId: {
        type: String,
        // required: true
    },
    profilePic: {
        type: String
    }
})

// "users" - collection
const users = mongoose.model("users", userSchema)
module.exports = users