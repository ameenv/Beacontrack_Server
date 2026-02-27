const { Status } = require("../utils/statusCode")

exports.restrictToRoles = (...roles) => {
    return (req, res, next) => {
        // Allow access directly if role is guest
        console.log({ roles, user: req.user?.role });
        if (roles.includes("guest")) {
            return next();
        }

        if (!roles.includes(req.user.role)) {
            return res.status(Status.ACCESS_DENIED).json('Access Denied')
        }
        next()
    }
}

exports.restrictToDeviceOwnerOrAdmin = (req, res, next) => {
    // const device = await Device.findById(req.params.id);
    // if (!device) return res.status(404).json({ message: 'Device not found' });

    // const isOwner = device.owner.toString() === req.user.id;
    // const isAdmin = req.user.role === 'admin';

    // if (!isOwner && !isAdmin) {
    //     return res.status(403).json({ message: 'Not authorized for this device' });
    // }

    // next();
}