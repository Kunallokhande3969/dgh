require("dotenv").config();
const express = require("express");
const app = express();

// ===== Logger =====
const logger = require("morgan");
app.use(logger("dev"));

// ===== Database =====
require("./models/database").connectDatabase();

// ===== CORS =====
const cors = require("cors");
app.use(
  cors({
    origin: ["https://jobs-and-internships.vercel.app", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.options("*", cors()); // प्रीफ्लाइट रिक्वेस्ट के लिए

// ===== Body Parsers =====
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// ===== Session/Cookies =====
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.EXPRESS_SESSION_SECRETE || "defaultsecret",
  })
);

// ===== Routes =====
app.use("/", require("./routes/indexRouter"));
app.use("/resume", require("./routes/resumeRoutes")); 
app.use("/employe", require("./routes/employeRouter")); 

// ===== Error Handling =====
const ErrorHandler = require("./utiles/ErorrHandler");
const { generatedErorrs } = require("./middlewares/erorrs");
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`URL Not Found: ${req.url}`, 404));
});
app.use(generatedErorrs);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));