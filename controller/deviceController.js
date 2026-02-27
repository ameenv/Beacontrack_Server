const devices = require('../model/deviceModel')
const mongoose = require('mongoose')
const users = require('../model/userModel')

exports.addUserDevice = async (req, res) => {
    console.log('add user device')
    const {
        type,
        geometry,
        properties: {
            serialno,
            name,
            description
        }
    } = req.body

    const groupId = req.user.userId

    try {
        const existingDevice = await devices.findOne({ serialno })
        if (existingDevice) {
            res.status(406).json('device allready added')
        }
        else {
            const addDevice = new devices({
                // _id: new mongoose.Types.ObjectId(),
                type,
                geometry,
                properties: {
                    deviceGroupId: groupId,
                    serialno,
                    name,
                    description
                }
            })

            await addDevice.save()
            res.status(200).json(addDevice)
        }
    } catch (error) {
        res.status(401).json(`adding new device error: ${error}`)
    }
}

exports.getUserDevices = async (req, res) => {
    console.log('get user devices')

    const deviceGroupId = req.user.userId

    try {
        const allDevices = await devices.find()
        const userDevices = allDevices.filter(device => device.properties.deviceGroupId == deviceGroupId)

        res.status(200).json(userDevices)
    } catch (error) {
        res.status(401).json(`get user devices error: ${error}`)
    }
}

exports.getAllDevices = async (req, res) => {
    console.log('get all devices')

    try {
        const allDevices = await devices.find()

        res.status(200).json(allDevices)
    } catch (error) {
        res.status(401).json(`get all devices error: ${error}`)
    }
}

exports.getAllDevicesforAboutPage = async (req, res) => {
    console.log('inside getAllDevicesforAboutPage')

    try {
        const allDevices = await devices.find()

        // Count all geofences (Point geometries)
        const geofenceCount = await devices.countDocuments({
            "geometry.type": "Point"
        });

        res.status(200).json({deviceList: allDevices, geofenceCount})
    } catch (error) {
        res.status(401).json(`get all devices for about page error: ${error}`)
    }
}

exports.deleteUserDevice = async (req, res) => {
    console.log('inside deleteUserDevice')

    const { id } = req.params

    try {
        // id removed
        const deleteDevice = await devices.findByIdAndDelete({ _id: id })
        res.status(200).json(deleteDevice)

    } catch (error) {
        res.status(401).json(`delete user devices error: ${error}`)
    }
}

exports.editUserDevice = async (req, res) => {
    console.log('inside editUserDevice')

    const { id } = req.params

    const { type, geometry, properties } = req.body
    try {
        // id removed
        const updatedDevice = await devices.findByIdAndUpdate({ _id: id }, { type, geometry, properties }, { new: true })
        await updatedDevice.save()
        res.status(200).json(updatedDevice)

    } catch (error) {
        res.status(401).json(`update user devices error: ${error}`)
    }
}

// internal gemini call only
exports.raiseTokenForFaultDevice = async (emailId, deviceSerialNo) => {
    console.log('raiseTokenForFaultDevice: internal gemini call only')

    try {
        // check ticket already exists
        const existingUser = await users.findOne({
            email: emailId,
            ticket: { $elemMatch: { deviceId: deviceSerialNo, status: "pending" } }
        });

        if (existingUser) {
            // User already has a ticket for this device
            return "user already raised a ticket for this device";
        }

        // raising a ticket
        const deviceOwner = await users.findOneAndUpdate(
            { email: emailId },
            {
                $push: {
                    ticket: { deviceId: deviceSerialNo, status: "pending" }
                }
            },
            { new: true }
        );

        // save a ticket
        // await deviceOwner.save()

        // device
        const failedDevice = await devices.findOneAndUpdate({ _id: deviceSerialNo }, { $set: { 'properties.status': "inactive" } }, { new: true })
        await failedDevice.save()

        if (deviceOwner) {
            return deviceOwner.username;
        }
        return null;

    } catch (error) {
        console.log(error)
    }
}

exports.trackDevices = async (req, res) => {
    console.log('trackDevices')

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.flushHeaders(); // Important for streaming

    const changeStream = devices.watch([], { fullDocument: 'updateLookup' });

    changeStream.on('change', (change) => {
        // res.write(`${JSON.stringify(change)}`);
        res.write(`data: ${JSON.stringify(change.fullDocument)}\n\n`);
        console.log(change);
    });

    req.on('close', () => {
        changeStream.close();
        res.end();
    });
}