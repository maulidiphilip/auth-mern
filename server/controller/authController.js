const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../model/User");
const transporter = require("../config/nodeMailer");

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

    // Prepare the email options
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Welcome to Fumuwee",
      text: `Welcome to Fumuwee website, ${name}! Your account has been successfully created with the email ID: ${email}.`,
    };

    // Send the welcome email
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("Welcome email sent successfully:", info.response);
    } catch (emailError) {
      console.error("Error sending welcome email:", emailError);
    }

    // Respond with success and user details
    res.status(201).json({
      success: true,
      message: "User registered successfully. A welcome email has been sent.",
    });
  } catch (error) {
    console.log(error); // Log any errors that occur during registration
    res.status(500).json({
      success: false,
      message: "Some error occurred", // Respond with a 500 error for any unexpected issues
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "missing fields, email & required",
    });
  }

  //if we have the email add try-catch block
  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "invalid email",
      });
    }

    // if the user exist in the DB chech the password

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      // if password nt matching
      return res.json({
        success: false,
        message: "password not matching",
      });
    }

    // generate a token if all the conditions matchhes
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

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.log(error); // Log any errors that occur during registration
    res.status(500).json({
      success: false,
      message: "Some error occurred", // Respond with a 500 error for any unexpected issues
    });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true, // The cookie is accessible only via HTTP(S), not JavaScript
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", // SameSite attribute for CSRF protection
    });
    return res.status(200).json({
      success: true,
      message: "logged out",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
// Export the controller function for use in routes
module.exports = { register, login, logout };
