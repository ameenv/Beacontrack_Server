const mongoose = require('mongoose')

const deviceSchema = new mongoose.Schema({
    // _id: mongoose.Schema.Types.ObjectId,
    type: {
        type: String,
        enum: ['Feature', 'Sensor', 'Tracker'],
        required: true
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point', 'LineString', 'Polygon'],   // support multiple geometry
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
            validate: {
                validator: function (arr){
                    // check for Point geometry
                    if(this.geometry.type === 'Point') return arr.length === 2
                    // LineString or Polygon are not used
                },
                message: 'Coordinates must be [longitude, latitude]'
            }
        }
    },
    properties: {
        
        // for a user, all devices are saved as group with same user _id
        deviceGroupId: {
            type: String,
            required: true,
            unique:true
        },
        serialno: {
            type: String,
            required: true,
            unique: true
        },
        name: {
            type: String,
            required: true,
            unique: true
        },
        description: String,
        battery: {
            type: Number,
            required: true,
            default: 90
        },
        network: {
            type: Number,
            required: true,
            default: 75
        },
        status:{
            type: String,
            enum: ['active', 'inactive'],
            default: 'active',
            required: true
        }

    }
})

const devices = mongoose.model("devices", deviceSchema)
module.exports = devices