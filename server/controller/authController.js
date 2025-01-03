const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/User");

// Register controller function
const register = async (req, res) => {
  // Destructure name, email, and password from the request body
  const { name, email, password } = req.body;

  // Check if any required field is missing
  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing details", // Send a 400 response if any field is missing
    });
  }

  try {
    // Check if a user with the provided email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists", // Respond with an error if the user already exists
      });
    }

    // Hash the user's password using bcrypt with a salt factor of 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance with the provided details and hashed password
    const user = new userModel({ name, email, password: hashedPassword });

    // Save the new user to the database
    await user.save();

    // Generate a JWT for the newly registered user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d", // The token will expire in 3 days
    });

    // Set a cookie in the user's browser with the generated token
    res.cookie("token", token, {
      httpOnly: true, // The cookie is accessible only via HTTP(S), not JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // SameSite attribute for CSRF protection
      maxAge: 5 * 24 * 60 * 60 * 1000, // Cookie expiration time: 5 days
    });

    // Respond with success and user details
    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error); // Log any errors that occur during registration
    res.status(500).json({
      success: false,
      message: "Some error occurred", // Respond with a 500 error for any unexpected issues
    });
  }
};

// Export the controller function for use in routes
module.exports = { register };
