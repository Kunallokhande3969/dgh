require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const logger = require("morgan");
const ErrorHandler = require("./utiles/ErorrHandler");
const { generatedErorrs } = require("./middlewares/erorrs");

const app = express();

app.use(helmet());
app.use(logger("dev"));
require("./models/database").connectDatabase();

const allowedOrigins = [
  "https://jobs-and-internships.vercel.app",

];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"), false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(cookieParser());
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRETE,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    }
  })
);

app.use("/", require("./routes/indexRouter"));
app.use("/resume", require("./routes/resumeRoutes"));
app.use("/employe", require("./routes/employeRouter"));

app.use((req, res, next) => {
  res.status(405).json({
    error: `Method ${req.method} not allowed at ${req.originalUrl}`
  });
});

app.use(generatedErorrs);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));