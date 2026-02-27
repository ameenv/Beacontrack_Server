const express = require('express')
const userController = require('../controller/userController')
const deviceController = require('../controller/deviceController')
const jwtMiddleware = require('../middleware/jwtMiddleware')
const accessRoles = require('../middleware/accessMiddleware')
const aiChatBot = require('../controller/geminiController')
const paymentController = require('../controller/paymentsController')
const testimonialController = require('../controller/testimonialController')
const contactUsController = require('../controller/contactUsController')
const enterpriseSalesContactController = require('../controller/enterpriseSalesContactController')

const router = new express.Router()

router.post('/register', userController.registerController)
router.post('/login', userController.loginController)

// edit user profile

// admin - get all users - return array of objects as all users  
router.get('/get-allusers', jwtMiddleware, accessRoles.restrictToRoles('admin'), userController.getAllUsers)
router.get('/stream/get-all-users', userController.getAllUsersStream)

router.get('/get-alldevices', jwtMiddleware, accessRoles.restrictToRoles('admin'), deviceController.getAllDevices)

// guest
router.get('/get-alldevices-aboutpage', deviceController.getAllDevicesforAboutPage)

// delete user and admin
router.delete('/delete/user/:id', jwtMiddleware, accessRoles.restrictToRoles('admin'), userController.deleteUser)

// device service ticket update
router.put('/device-ticket/:userId/device/:deviceId/update-action', jwtMiddleware, accessRoles.restrictToRoles('admin'), userController.userServiceTicketUpdate)

// verify and finish payment
router.put('/service-action', jwtMiddleware, accessRoles.restrictToRoles('admin'), paymentController.verifyPayment)

// add user devices
router.post('/add-userdevice', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), deviceController.addUserDevice)

// get user devices
router.get('/get-userdevices', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), deviceController.getUserDevices)

// edit user devices
router.put('/edit/device/:id', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), deviceController.editUserDevice)

// delete user device
router.delete('/delete/device/:id', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), deviceController.deleteUserDevice)

// add or update testimonial in a single go
router.put('/testimonials/add', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), testimonialController.addUpdateTestimonial)

// get all testimonials
router.get('/testimonials/all', testimonialController.getAllTestimonials)

// delete testimonial
router.delete('/testimonials/remove/:id', jwtMiddleware, accessRoles.restrictToRoles('admin'), testimonialController.removeTestimonial)

// add contact us message
router.post('/contact-us/add', contactUsController.addContactUsMessage)

// get all contact-us requests
router.get('/contact-us/get-all', jwtMiddleware, accessRoles.restrictToRoles('admin'), contactUsController.getAllContactUsMessage)

// delete contact us message
router.delete('/contact-us/remove/:id', jwtMiddleware, accessRoles.restrictToRoles('admin'), contactUsController.removeContactUsMessage)

// enterprise sales requests - add
router.post('/enterprise-requests/add', enterpriseSalesContactController.addEnterpriseSaleContact)

// enterprise sales requests - get-all
router.get('/enterprise-requests/get-all', jwtMiddleware, accessRoles.restrictToRoles('admin'), enterpriseSalesContactController.getAllEnterpriseSaleContacts)

// enterprise sales requests - delete
router.delete('/enterprise-requests/remove/:id', jwtMiddleware, accessRoles.restrictToRoles('admin'), enterpriseSalesContactController.removeEnterpriseSaleContact)

// gemini
router.post('/aichat', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), aiChatBot)

// track events
router.get('/events', deviceController.trackDevices)

// --------- payment
router.post('/create-order', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), paymentController.createOrder)
router.post('/verify-payment', jwtMiddleware, accessRoles.restrictToRoles('admin', 'user'), paymentController.verifyPayment)

module.exports = router