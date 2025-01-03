const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const dbConnect = require("./config/mongoDb");

const app = express();
dotenv.config();

dbConnect();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => res.send("API now works!"));

app.listen(port, () => console.log(`Server staeted on port: ${port}`));
