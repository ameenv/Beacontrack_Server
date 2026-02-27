const users = require("../model/userModel");
const { createRazorpayInstance } = require("../payment/razorpay");
const crypto = require('crypto')

require('dotenv').config()

var razorpayInstance = createRazorpayInstance()

exports.createOrder = async (req, res) => {
    console.log('inside createOrder');

    const { amountRs, order_receipt } = req.body
    const razorKey = process.env.RAZORPAY_KEY

    // Open Razorpay Checkout
    var options = {
        amount: amountRs * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        receipt: order_receipt,
        currency: 'INR',
        payment_capture: 1,
    };

    try {
        razorpayInstance.orders.create(options, (err, order) => {
            if (err) {
                return res.status(400).json({
                    success: false,
                    message: `some thing went wrong ${err}`
                })
            }
            return res.status(200).json({ order, razor_key: razorKey })
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: `some thing went wrong ${error}`
        })
    }
}

exports.verifyPayment = async (req, res) => {
    console.log('inside verifyPayment');

    const { order_id, payment_id, signature , device_limit, user_plan} = req.body
    const userId = req.user.userId
    const secret_key = process.env.RAZORPAY_SECRET

    // create hmac object
    const hmac = crypto.createHmac('sha256', secret_key)
    hmac.update(order_id + "|" + payment_id)
    const generatedSignature = hmac.digest('hex')

    if (generatedSignature === signature) {
        // db operations
        try {
            const userOrderIdUpdate = await users.findOneAndUpdate({ _id: userId }, { $set: { orderId: order_id, paymentId: payment_id , deviceLimit: device_limit, userPlan: user_plan} }, { new: true })
            await userOrderIdUpdate.save()
        } catch (error) {
            console.error(error)
        }

        return res.status(200).json({
            success: true,
            message: "payment verified"
        })
    }
    else {
        return res.status(400).json({
            success: false,
            message: "payment not verified"
        })
    }
}

exports.webhook = async (req, res) => {
    console.log('inside webhook');

    const webhookSecret = 12345
    const receivedSignature = req.headers['x-razorpay-signature']

    const body = JSON.stringify(req.body)

    // create hmac object
    const expectedSignature = crypto.createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

    if (receivedSignature === expectedSignature) {
        // database update

        res.status(200).json({
            success: true,
            message: "payment verified"
        })
    }
    else {
        console.error('webhook verification failed')
        res.status(400).json({
            success: false,
            message: "payment not verified"
        })
    }
}