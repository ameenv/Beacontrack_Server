const enterpriseSaleContacts = require('../model/enterpriseSalesContactModel')

exports.addEnterpriseSaleContact = async (req, res) => {
    const { name, email, message } = req.body
    try {
        const existingEnterpriseSale = await enterpriseSaleContacts.findOne({email})
        if(existingEnterpriseSale){
            res.status(409).json("Sale request already exists")
        }
        else 
        {
            const newSale = new enterpriseSaleContacts({name: name, email: email, message: message})
            await newSale.save()
            res.status(200).json(newSale)
        }
        
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.getAllEnterpriseSaleContacts = async (req, res) => {
    try {
        const allEnterpriseSales = await enterpriseSaleContacts.find()
        res.status(200).json(allEnterpriseSales)
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.removeEnterpriseSaleContact = async (req, res) => {
    const {id} = req.params

    try {
        const saleDeleted = await enterpriseSaleContacts.findByIdAndDelete({_id: id})
        res.status(200).json(saleDeleted)
    } catch (error) {
        res.status(401).json(error)
    }
}