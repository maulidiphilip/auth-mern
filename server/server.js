const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const app = express();
dotenv.config();

const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true }));

app.get("/", (req, res) => res.send("API now works!"));

app.listen(port, () => console.log(`Server staeted on port: ${port}`));
