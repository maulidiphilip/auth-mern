const jwt = require("jsonwebtoken");

// a function that will find a token from the cookie, from that it will find the user id
const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Not authorized, please login",
    });
  }

  // if token available
  try {
    // decode the token
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.id) {
      req.body.userId = tokenDecode.id;
    } else {
      return res.json({
        success: false,
        message: "Not authorized, please login",
      });
    }

    next(); // this will call the next function
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = userAuth;
