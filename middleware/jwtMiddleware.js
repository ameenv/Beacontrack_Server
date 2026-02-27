const jwt = require('jsonwebtoken')

const jwtMiddleware = (req, res, next) => {

    try {
        // receive token from user
        const token = req.header('authorization').split(" ")[1]

        // verify the token
        const jwtResponse = jwt.verify(token, process.env.JWT_PASSWORD)

        console.log(jwtResponse)

        // userId key - added to req object, to access it in other controllers
        req.user = jwtResponse

        // if the verification is done.Then control passed from jwt to next controller
        next()
    } catch (error) {
        res.status(401).json(`authorization failed ${error}`)
    }
}

module.exports = jwtMiddleware