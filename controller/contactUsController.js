const contactUsRequests = require('../model/contactUsModel')

exports.addContactUsMessage = async (req, res) => {
    console.log('inside addContactUsMessage');

    const { name, email, message } = req.body

    try {
        const sendMesg = new contactUsRequests({ name, email, message })
        await sendMesg.save()
        res.status(200).json(sendMesg)
    } catch (error) {
        res.status(401).json(`error updating message: ${error}`)
    }
}

exports.getAllContactUsMessage = async (req, res) => {
    console.log('inside getAllContactUsMessage');

    try {
        const allMesgs = await contactUsRequests.find()
        res.status(200).json(allMesgs)
    } catch (error) {
        res.status(401).json(`error getting message: ${error}`)
    }
}

exports.removeContactUsMessage = async (req, res) => {
    console.log('inside removeContactUsMessage');
    
    const { id } = req.params

    try {
        const deleteMesg = await contactUsRequests.findByIdAndDelete({ _id: id })
        res.status(200).json(deleteMesg)
    } catch (error) {
        res.status(401).json(`error deleting message: ${error}`)
    }
}