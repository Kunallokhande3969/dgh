const express = require("express");
const router = express.Router();
const multer = require("multer");
const { isAuthenticated } = require("../middlewares/auth");
const imagekit = require("../utiles/imageKit");
const {
  resume,
  addeducation,
  editeducation,
  deleteeducation,
  addjob,
  editjob,
  deletejob,
  addintern,
  editintern,
  deleteintern,
  addresp,
  editresp,
  deleteresp,
  addcourse,
  editcourse,
  deletecourse,
  addproj,
  editproj,
  deleteproj,
  addskill,
  editskill,
  deleteskill,
  addacmp,
  editacmp,
  deleteacmp,
  uploadAndAnalyze,
} = require("../controllers/resumeController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get("/", isAuthenticated, asyncHandler(resume));

router.post("/add-edu", isAuthenticated, asyncHandler(addeducation));
router.post("/edit-edu/:eduid", isAuthenticated, asyncHandler(editeducation));
router.post("/delete-edu/:eduid", isAuthenticated, asyncHandler(deleteeducation));

router.post("/add-job", isAuthenticated, asyncHandler(addjob));
router.post("/edit-job/:jobid", isAuthenticated, asyncHandler(editjob));
router.post("/delete-job/:jobid", isAuthenticated, asyncHandler(deletejob));

router.post("/add-intern", isAuthenticated, asyncHandler(addintern));
router.post("/edit-intern/:internid", isAuthenticated, asyncHandler(editintern));
router.post("/delete-intern/:internid", isAuthenticated, asyncHandler(deleteintern));

router.post("/add-resp", isAuthenticated, asyncHandler(addresp));
router.post("/edit-resp/:respid", isAuthenticated, asyncHandler(editresp));
router.post("/delete-resp/:respid", isAuthenticated, asyncHandler(deleteresp));

router.post("/add-course", isAuthenticated, asyncHandler(addcourse));
router.post("/edit-course/:courseid", isAuthenticated, asyncHandler(editcourse));
router.post("/delete-course/:courseid", isAuthenticated, asyncHandler(deletecourse));

router.post("/add-proj", isAuthenticated, asyncHandler(addproj));
router.post("/edit-proj/:projid", isAuthenticated, asyncHandler(editproj));
router.post("/delete-proj/:projid", isAuthenticated, asyncHandler(deleteproj));

router.post("/add-skill", isAuthenticated, asyncHandler(addskill));
router.post("/edit-skill/:skillid", isAuthenticated, asyncHandler(editskill));
router.post("/delete-skill/:skillid", isAuthenticated, asyncHandler(deleteskill));

router.post("/add-acmp", isAuthenticated, asyncHandler(addacmp));
router.post("/edit-acmp/:acmpid", isAuthenticated, asyncHandler(editacmp));
router.post("/delete-acmp/:acmpid", isAuthenticated, asyncHandler(deleteacmp));

const handleUpload = (req, res, next) => {
  upload.single("resume")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.code === "LIMIT_FILE_SIZE"
          ? "File too large (max 5MB)"
          : err.message || "Invalid file upload"
      });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    next();
  });
};

router.post("/analyze", isAuthenticated, handleUpload, asyncHandler(uploadAndAnalyze));

router.post(
  "/upload-photo",
  isAuthenticated,
  photoUpload.single("photo"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No photo uploaded" });
    }
    const fileBase64 = req.file.buffer.toString("base64");
    const fileName = `avatar_${Date.now()}.${req.file.originalname.split(".").pop()}`;

    const result = await imagekit.upload({
      file: fileBase64,
      fileName,
      folder: "/avatars"
    });

    const Student = require("../models/studentModel");
    await Student.findByIdAndUpdate(
      req.user.id,
      { avatar: { url: result.url, fileId: result.fileId } },
      { new: true }
    );
    res.json({ success: true, url: result.url, fileId: result.fileId });
  })
);

module.exports = router;
