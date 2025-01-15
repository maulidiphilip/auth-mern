const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/mongoDb");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoute");

const app = express();
dotenv.config();

// db Connection in our application
dbConnect();

const port = process.env.PORT || 8000;

const allowedOrigins = ["http://localhost:5173"]; // all the frontend origins

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

// test route
app.get("/", (req, res) => res.send("API now works!"));

// auth route
app.use("/api/auth/", authRouter);

// user route
app.use("/api/user/", userRouter);
app.listen(port, () => console.log(`Server staeted on port: ${port}`));
