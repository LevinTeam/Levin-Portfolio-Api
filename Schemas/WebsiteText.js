import { Schema, model } from "mongoose";

const WebsiteText = new Schema({
    Key: {
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

export default model('WebsiteText', WebsiteText)