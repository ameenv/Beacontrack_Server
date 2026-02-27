const devices = require('../model/deviceModel')
const users = require('../model/userModel')
const jwt = require('jsonwebtoken')

exports.registerController = async (req, res) => {
    console.log('register controller')

    const { username, email, password, role } = req.body
    console.log(username, email, password, role);

    try {
        // check for existing user using email
        const existingUser = await users.findOne({ email })
        if (existingUser) {
            // user already exists
            res.status(406).json('user already exists')
        }
        else {
            // add new user to the "users" collection
            const result = new users({ username, email, password, role })

            // save to database
            await result.save()

            // send respose back to client
            res.status(200).json(result)
        }
    } catch (error) {
        console.log(`server-login error: ${error}`)
        res.status(401).json(error)
    }

}

exports.loginController = async (req, res) => {
    console.log('login controller')

    // access login details
    const { email, password } = req.body

    try {
        // check for the user
        const existingUser = await users.findOne({ email, password })
        if (existingUser) {
            // generate token for the user
            const token = jwt.sign({ userId: existingUser._id, role: existingUser.role }, process.env.JWT_PASSWORD)
            res.status(200).json({
                user: existingUser,
                token
            })
        }
        else {
            // user doesn't registered
            res.status(404).json('Invalid user name password')
        }
    } catch (error) {
        res.status(401).json(`user login error: ${error}`)
    }
}

exports.getAllUsers = async (req, res) => {
    console.log('getAllUsers')
    try {
        const allUsers = await users.find()
        res.status(200).json(allUsers)

    } catch (error) {
        res.status(401).json(`getAllUsers error: ${error}`)
    }
}

// Stream route (Server-Sent Events)
exports.getAllUsersStream = async (req, res) => {
    console.log('inside getAllUsersStream')

    const token = req.query.token;
    try {
        jwt.verify(token, process.env.JWT_PASSWORD);
    } catch (err) {
        return res.status(401).end();
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const changeStream = users.watch();

    changeStream.on("change", async () => {
        const newUsers = await users.find({});
        res.write(`data: ${JSON.stringify(newUsers)}\n\n`);
    });

    req.on("close", () => {
        changeStream.close();
        res.end();
    });
}

exports.deleteUser = async (req, res) => {
    console.log('inside deleteUserAPI')

    const { id } = req.params

    try {
        const deleteUser = await users.findByIdAndDelete({ _id: id })
        res.status(200).json(deleteUser)
    }
    catch (error) {
        res.status(401).json(`delete user error: ${error}`)
    }
}

exports.userServiceTicketUpdate = async (req, res) => {
    console.log('inside userServiceUpdate')

    // get user id and device id
    const { userId, deviceId } = req.params
    const { action } = req.query

    console.log(userId, deviceId, action);
    let updateDeviceStatus = ""

    try {
        const ticketUpdate = await users.findOneAndUpdate(
            { _id: userId },
            { $set: { "ticket.$[elem].status": action } },
            {
                arrayFilters: [{ "elem.deviceId": deviceId }],
                new: true
            }
        );

        await ticketUpdate.save()

        switch (action) {
            case 'resolved':
                updateDeviceStatus = 'active'
                break;
            case 'rejected':
                updateDeviceStatus = 'fault'
                break;
            case 'pending':
                updateDeviceStatus = 'inactive'
                break;
            default:
                break;
        }

        const updateDevice = await devices.findOneAndUpdate(
            { _id: deviceId },
            {
                $set: {
                    "properties.status": updateDeviceStatus
                }
            },
            { new: true })

        await updateDevice.save()

        res.status(200).json({ ticketUpdate, updateDevice })


    } catch (error) {
        res.status(401).json(`ticket update error: ${error}`)
    }
}