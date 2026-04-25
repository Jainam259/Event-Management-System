// backend/models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name:     { type: String },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

// ⭐ This prevents OverwriteModelError when model is already compiled
module.exports = mongoose.models.User || mongoose.model("User", UserSchema);