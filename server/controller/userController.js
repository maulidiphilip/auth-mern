const User = require("../model/User");

const getUserInfo = async (req, res) => {
  try {
    const { userId } = req.body;

    // find user in database
    const user = await User.findById(userId);

    if (!user) {
      // user not available
      return res.json({
        success: false,
        message: "User not Found",
      });
    }

    res.status(200).json({
      success: true,
      userData: {
        name: user.name,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An unexpected error occurred. Please try again.", // Respond with a generic error message
    });
  }
};
module.exports = getUserInfo;
