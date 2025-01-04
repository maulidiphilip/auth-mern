const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/mongoDb");

const authRouter = require("./routes/authRoutes");

const app = express();
dotenv.config();

// db Connection in our application
dbConnect();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

// test route
app.get("/", (req, res) => res.send("API now works!"));

// auth route
app.use("/api/auth/", authRouter);
app.listen(port, () => console.log(`Server staeted on port: ${port}`));
