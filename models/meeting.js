const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema(
    {
        zoomLink: {
            type: String,
            required: true,
        },
        meetingTime: {
            type: Date,
            required: true,
        },
        scrumSheet: {
            type: String,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("Meeting", meetingSchema);