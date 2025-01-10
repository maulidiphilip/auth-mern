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

// send OTP verification code to user's email for verifcation
const sendVerifyOtp = async (req, res) => {
  try {
    const { userId } = req.body;

    // Find the user by their ID
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found", // Respond if the user does not exist
      });
    }

    // Check if the account is already verified
    if (user.isVerified) {
      return res.json({
        success: false,
        message: "Account already verified", // Respond if the account is already verified
      });
    }

    // Generate a 6-digit OTP to be sent to the user's email for verification
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a random 6-digit OTP
    user.verifyotp = otp;

    // Set the expiry time for this OTP (24 hours from now)
    user.verifyotpExpireAt = Date.now() + 24 * 60 * 60 * 1000;

    // Save the user with the new OTP and expiry time in the database
    await user.save();

    // Prepare the email options for sending the OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // Sender's email address
      to: user.email, // User's email address
      subject: "Account Verification OTP", // Subject of the email
      text: `Your OTP is ${otp}. Please verify your account using this OTP.`, // Email content
    };

    // Send the email containing the OTP
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("OTP code sent successfully:", info.response); // Log email success
    } catch (emailError) {
      console.error("Error sending OTP:", emailError); // Log email error
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.", // Respond with an error message
      });
    }

    // Respond with success if OTP is sent successfully
    res.status(201).json({
      success: true,
      message: "OTP verification sent to email", // Inform the user about the successful OTP email
    });
  } catch (error) {
    console.error("Error during OTP generation:", error); // Log unexpected errors
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};

const verifyEmail = async (req, res) => {
  const { userId, otp } = req.body;
  // check userID & otp if available
  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "missing details",
    });
  }

  try {
    // finf the user from the userId
    const user = await userModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found", // Respond if the user does not exist
      });
    }

    if (user.verifyotp === "" || user.verifyotp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.", // Respond with an error message
      });
    }

    // if otp is valid check for its expiry date
    if (user.verifyotpExpireAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired.", // Respond with an error message
      });
    }

    // otp not expired, verify user account make it true now
    user.isVerified = true;
    // reset verification OTP
    user.verifyotp = "";
    user.verifyotpExpireAt = 0;

    // save the user data
    await user.save();

    // Respond with success if email is verified successfully
    res.status(201).json({
      success: true,
      message: "Email verification is successful", // Inform the user about the successful OTP email
    });
  } catch (error) {
    console.log(error); //log unexpected errors
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};

// function to check if user already authenticated
const isAuthenticated = async (req, res) => {
  try {
    return res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};

// a function to reset password otp
const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  // chech if email available or not
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email required", // Respond if the email does not exist
    });
  }
  try {
    const user = await userModel.findOne({ email });
    // if user not available
    if (!user) {
      return res.json({
        success: false,
        message: "User not Found",
      });
    }

    // if user is available with the email provided generate the OTP an store it in the database, & send it to email
    const otp = String(Math.floor(100000 + Math.random() * 900000)); // Generate a random 6-digit OTP
    user.resetotp = otp;

    // Set the expiry time for this OTP (15 minutes from now)
    user.resetotpExpireAt = Date.now() + 15 * 60 * 1000;

    // Save the user with the new OTP and expiry time in the database
    await user.save();

    // Prepare the email options for sending the OTP
    const mailOptions = {
      from: process.env.SENDER_EMAIL, // Sender's email address
      to: user.email, // User's/receiver email address
      subject: "Password reset OTP", // Subject of the email
      text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with reseting your password.`, // Email content
    };

    // Send the email containing the OTP
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("OTP code sent successfully:", info.response); // Log email success
    } catch (emailError) {
      console.error("Error sending OTP:", emailError); // Log email error
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again later.", // Respond with an error message
      });
    }
    res.status(201).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};
// verify OTP & and reset the password
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    res.status(400).json({
      success: false,
      message: "Email, OTP, & new Password required",
    });
  }

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      // user not available
      return res.json({
        success: false,
        message: "User not Found",
      });
    }

    if (user.resetotp === "" || user.resetotp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.resetotpExpireAt < Date.now()) {
      return res.json({
        success: false,
        message: "OTP already expired",
      });
    }

    // otp valid
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // store it in the database
    user.password = hashedPassword;

    // reset the otp
    user.resetotp = "";

    user.resetotpExpireAt = 0;

    await user.save(); // new details save to the database
    res.status(201).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};
// Export the controller function for use in routes
module.exports = {
  register,
  login,
  logout,
  sendVerifyOtp,
  verifyEmail,
  isAuthenticated,
  sendResetOtp,
  resetPassword,
};
