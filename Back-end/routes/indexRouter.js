const express = require("express");
const router = express.Router();
const {
  homepage,
  studentsignup,
  studentsignin,
  studentsignout,
  current,
  studentsendmail,
  studentforgetlink,
  studentresetpassword,
  studentupdate,
  studentavatar,
  applyinternship,
  applyjob,
  deletestudent,
  studentreadalljobs,
  studentreadallinternships,
  readsinglejob,
  readsingleinternship,
} = require("../controllers/indexController");
const { isAuthenticated } = require("../middlewares/auth");

// Page/home route
router.get("/", homepage);

// Student profile (both GET for fetch, POST for session restore)
router.route("/student")
  .get(isAuthenticated, current)
  .post(isAuthenticated, current);

// Delete student: **POST not GET**
router.post("/student/delete", isAuthenticated, deletestudent);

// Signup & Signin: POST (form submit/create)
router.post("/student/signup", studentsignup);
router.post("/student/signin", studentsignin);

// Signout: GET (fetch)
router.get("/student/signout", isAuthenticated, studentsignout);

// Email & password features
router.post("/student/send-mail", studentsendmail);
router.post("/student/forget-link", studentforgetlink);
router.post("/student/reset-password/:id", isAuthenticated, studentresetpassword);

// Update profile: POST or PUT (update)
router.post("/student/update/:id", isAuthenticated, studentupdate);

// Read all jobs/internships: **GET, not POST**
router.get("/student/alljob", isAuthenticated, studentreadalljobs);
router.get("/student/allinternship", isAuthenticated, studentreadallinternships);

// Avatar upload: POST (form upload)
router.post("/student/avatar/:id", isAuthenticated, studentavatar);

// Apply internships/jobs: POST
router.post("/student/apply/internship/:internshipid", isAuthenticated, applyinternship);
router.post("/student/apply/job/:jobid", isAuthenticated, applyjob);

// Single job/intern read: **GET, not POST**
router.get("/job/read/:id", isAuthenticated, readsinglejob);
router.get("/internship/read/:id", isAuthenticated, readsingleinternship);

module.exports = router;
