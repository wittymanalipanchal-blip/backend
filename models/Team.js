const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    code: String,

    name: {
      type: String,
      required: true,
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 🔥 Team Manager
      required: true,
    },

    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    performance: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true } // 🔥 createdAt
);

module.exports = mongoose.model("Team", teamSchema);
