const { catchAsyncErorrs } = require("../middlewares/catchAsyncErorrs");
const Internship = require("../models/internshipModel");
const Job = require("../models/jobModel");
const Student = require("../models/studentModel");
const ErorrHandler = require("../utiles/ErorrHandler");
const { sendtoken } = require("../utiles/SendTokens");
const { sendmail } = require("../utiles/nodemailer");
const imagekit = require("../utiles/imageKit");
const path = require("path");

exports.homepage = catchAsyncErorrs(async (req, res, next) => {
  res.json({
    message: "Secure Homepage!",
  });
});

exports.current = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id)
    .populate("jobs")
    .populate("internships")
    .exec();
  res.json(student);
});

exports.deletestudent = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findByIdAndDelete(req.id).exec();
  if (!student) {
    return next(new ErorrHandler("Student not found", 404));
  }
  res.json({ success: true, student, message: "User deleted successfully" });
});

exports.studentsignup = catchAsyncErorrs(async (req, res, next) => {
  const { firstname, lastname, email, password, contact, city } = req.body;

  // Validate required fields
  if (!firstname || !lastname || !email || !password || !contact || !city) {
    return next(
      new ErorrHandler("All fields are required: firstname, lastname, email, password, contact, city", 400)
    );
  }

  // Check if email exists
  const existingStudent = await Student.findOne({ email });
  if (existingStudent) {
    return next(new ErorrHandler("Email already registered", 400));
  }

  const student = await new Student({
    firstname,
    lastname,
    email,
    password,
    contact,
    city
  }).save();

  sendtoken(student, 201, res);
});

exports.studentsignin = catchAsyncErorrs(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErorrHandler("Please provide email and password", 400));
  }

  const student = await Student.findOne({ email }).select("+password").exec();
  
  if (!student) {
    return next(new ErorrHandler("Invalid email or password", 401));
  }

  const isMatch = await student.comparepassword(password);
  if (!isMatch) {
    return next(new ErorrHandler("Invalid email or password", 401));
  }

  sendtoken(student, 200, res);
});

exports.studentsignout = catchAsyncErorrs(async (req, res, next) => {
  res.clearCookie("token");
  res.json({ message: "Successfully signed out" });
});

exports.studentsendmail = catchAsyncErorrs(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new ErorrHandler("Please provide email", 400));
  }

  const student = await Student.findOne({ email }).exec();
  if (!student) {
    return next(new ErorrHandler("User not found with this email address", 404));
  }

  const otp = Math.floor(1000 + Math.random() * 9000);
  await sendmail(req, res, next, otp);
  
  student.resetPasswordToken = otp.toString();
  await student.save();
  
  res.json({ 
    success: true,
    message: "OTP sent to email",
    otp // Remove this in production
  });
});

exports.studentforgetlink = catchAsyncErorrs(async (req, res, next) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    return next(new ErorrHandler("Email, OTP and password are required", 400));
  }

  const student = await Student.findOne({ email }).exec();
  if (!student) {
    return next(new ErorrHandler("User not found", 404));
  }

  if (student.resetPasswordToken !== otp.toString()) {
    return next(new ErorrHandler("Invalid OTP", 400));
  }

  student.password = password;
  student.resetPasswordToken = "0";
  await student.save();

  res.status(200).json({
    success: true,
    message: "Password has been successfully changed"
  });
});

exports.studentresetpassword = catchAsyncErorrs(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(new ErorrHandler("Password is required", 400));
  }

  const student = await Student.findById(req.id).exec();
  student.password = password;
  await student.save();

  sendtoken(student, 200, res);
});

exports.studentupdate = catchAsyncErorrs(async (req, res, next) => {
  const updates = req.body;
  const student = await Student.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  }).exec();

  if (!student) {
    return next(new ErorrHandler("Student not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Student details updated successfully",
    student
  });
});

exports.studentavatar = catchAsyncErorrs(async (req, res, next) => {
  if (!req.files || !req.files.avatar) {
    return next(new ErorrHandler("Avatar file is required", 400));
  }

  const student = await Student.findById(req.params.id).exec();
  if (!student) {
    return next(new ErorrHandler("Student not found", 404));
  }

  const file = req.files.avatar;
  const modifiedName = `resumebuilder-${Date.now()}${path.extname(file.name)}`;

  if (student.avatar.fileId) {
    await imagekit.deleteFile(student.avatar.fileId);
  }

  const { fileId, url } = await imagekit.upload({
    file: file.data,
    fileName: modifiedName,
  });

  student.avatar = { fileId, url };
  await student.save();

  res.json({
    success: true,
    message: "Avatar uploaded successfully",
    avatar: url
  });
});

//=================Apply Internships===================
exports.applyinternship = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  const internship = await Internship.findById(req.params.internshipid).exec();

  if (!student || !internship) {
    return next(new ErorrHandler("Student or internship not found", 404));
  }

  if (student.internships.includes(internship._id)) {
    return next(new ErorrHandler("Already applied for this internship", 400));
  }

  student.internships.push(internship._id);
  internship.students.push(student._id);

  await Promise.all([student.save(), internship.save()]);

  res.json({
    success: true,
    message: "Applied for internship successfully",
    student,
    internship
  });
});

//================Apply Jobs===========================
exports.applyjob = catchAsyncErorrs(async (req, res, next) => {
  const student = await Student.findById(req.id).exec();
  const job = await Job.findById(req.params.jobid).exec();

  if (!student || !job) {
    return next(new ErorrHandler("Student or job not found", 404));
  }

  if (student.jobs.includes(job._id)) {
    return next(new ErorrHandler("Already applied for this job", 400));
  }

  student.jobs.push(job._id);
  job.students.push(student._id);

  await Promise.all([student.save(), job.save()]);

  res.json({
    success: true,
    message: "Applied for job successfully",
    student,
    job
  });
});

// ================job read all ===================
exports.studentreadalljobs = catchAsyncErorrs(async (req, res, next) => {
  const jobs = await Job.find().exec();
  res.status(200).json({
    success: true,
    count: jobs.length,
    jobs
  });
});

// =================internship all ===================
exports.studentreadallinternships = catchAsyncErorrs(async (req, res, next) => {
  const internships = await Internship.find().exec();
  res.status(200).json({
    success: true,
    count: internships.length,
    internships
  });
});

exports.readsinglejob = catchAsyncErorrs(async (req, res, next) => {
  const job = await Job.findById(req.params.id).exec();
  if (!job) {
    return next(new ErorrHandler("Job not found", 404));
  }
  res.status(200).json({
    success: true,
    job
  });
});

exports.readsingleinternship = catchAsyncErorrs(async (req, res, next) => {
  const internship = await Internship.findById(req.params.id).exec();
  if (!internship) {
    return next(new ErorrHandler("Internship not found", 404));
  }
  res.status(200).json({
    success: true,
    internship
  });
});