const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verifyotp: { type: String, default: "" },
  verifyotpExpireAt: { type: Number, default: 0 }, // Fixed typo: verifyotpExpereAt → verifyotpExpireAt
  isVerified: { type: Boolean, default: false },
  resetotp: { type: String, default: "" },
  resetotpExpireAt: { type: Number, default: 0 }, // Fixed typo: resetotpExpereAt → resetotpExpireAt
});

const userModel = mongoose.models.User || mongoose.model("User", userSchema); // Consistent naming for the model
module.exports = userModel; // Use `module.exports` for CommonJS
