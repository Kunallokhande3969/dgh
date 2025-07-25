const express = require("express");
const router = express.Router();
const upload = require("../utiles/Multer");
const {
  homepage,
  employesignup,
  employesignin,
  employesignout,
  currentEmploye,
  employesendmail,
  employeforgetlink,
  employeresetpassword,
  employeupdate,
  employeavatar,
  createinternship,
  readinternship,
  readsingleinternship,
  createjob,
  readjob,
  readsinglejob,
  deleteemploye,
  closejob,
} = require("../controllers/employeController");
const { isAuthenticated } = require("../middlewares/auth");

// Home route
router.get("/", homepage);

// Get current employe
router.get("/current", isAuthenticated, currentEmploye);

// Delete employe: POST
router.post("/delete", isAuthenticated, deleteemploye);
router.post("/signup", employesignup);
router.post("/signin", employesignin);
router.get("/signout", isAuthenticated, employesignout);

router.post("/send-mail", employesendmail);
router.post("/forget-link", employeforgetlink);
router.post("/reset-password/:id", isAuthenticated, employeresetpassword);
router.post("/update/:id", isAuthenticated, employeupdate);
router.post("/avatar/:id", isAuthenticated, upload.single("organizationLogo"), employeavatar);

// Internships: Read via GET
router.post("/internship/create", isAuthenticated, createinternship);
router.get("/internship/read", isAuthenticated, readinternship);
router.get("/internship/read/:id", isAuthenticated, readsingleinternship);

// Jobs: Read via GET
router.post("/job/create", isAuthenticated, createjob);
router.get("/job/read", isAuthenticated, readjob);
router.get("/job/read/:id", isAuthenticated, readsinglejob);
router.post("/job/close/:id", isAuthenticated, closejob);

module.exports = router;
