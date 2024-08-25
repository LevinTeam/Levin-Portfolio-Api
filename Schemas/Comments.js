import { Schema, model } from "mongoose";

const Comments = new Schema({
    Name: {
        type: String,
        required: true,
    },

    PhoneNumber: {
        type: String,
        required: false,
        default: "012345678910"
    },

    Email: {
        type: String,
        required: false,
        default: "unknownemail@example.com"
    },

    Subject: {
        type: String,
        required: true
    },

    Comment: {
        type: String,
        required: true
    }
})

export default model("Comments", Comments)