const testimonials = require('../model/testimonialModel')

exports.addUpdateTestimonial = async (req, res) => {
    console.log('inside addTestimonial');

    const { name, email, rating, avatar, review, approved } = req.body

    try {
        const existingUser = await testimonials.findOne({ email })

        if (!existingUser) {
            const newMesg = new testimonials({ name, email, rating, avatar, review, approved})
            await newMesg.save()
            res.status(200).json(newMesg)
        }
        else {
            const updateUser = await testimonials.findOneAndUpdate(
                { email: email },
                { $set: { rating: rating, review: review, approved: approved} },
                { new: true })

            res.status(200).json(updateUser)
        }
    } catch (error) {
        res.status(401).json(error)
    }
}

exports.getAllTestimonials = async (req, res) => {

    try {
        const allReviews = await testimonials.find()
        res.status(200).json(allReviews)
    } catch (error) {
        res.status(401).json(error)
    }
}

// exports.approveTestimonials = async (req, res) => {

//     const {id} = req.params

//     try {
//         const allReviews = await testimonials.findOneAndDelete()
//         res.status(200).json(allReviews)
//     } catch (error) {
//         res.status(401).json(error)
//     }
// }

exports.removeTestimonial = async (req, res) => {
    const { id } = req.params

    try {
        const deleteTestimonial = await testimonials.findByIdAndDelete({ _id: id })

        if (deleteTestimonial) {
            res.status(200).json(deleteTestimonial)
        }
    } catch (error) {
        res.status(401).json(error)
    }
}