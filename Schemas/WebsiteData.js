import { Schema, model } from "mongoose";

const WebsiteData = new Schema({
    ApiKey: {
        type: String,
        required: true
    },

    DataAvailability: {
        type: Number,
        required: false,
        default: 0
    },

    Texts: {
        type: Object,
        required: true
    }
})

export default model('WebsiteData', WebsiteData)