const express = require("express");
const router = express.Router();
const upload = require('../utils/uploadImage');

const {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,getExistingReportsOnly,deleteReport,editreport
} = require("../controllers/reportController");
const verifyToken = require("../middleware/authMiddleware");

// 🔐 هذا المسار محمي بالتوكن
router
  .delete("/:id", verifyToken, deleteReport)
  .put("/:id", verifyToken, upload.single('photo'),editreport);
router
  .post("/", verifyToken, upload.single('photo'),createReport)
  .get("/", verifyToken, getReports)
  .get("/other", verifyToken, getOtherUsersReports)
  .get("/lost", verifyToken, getLostReportsOnly)
  .get("/existing", verifyToken, getExistingReportsOnly);

module.exports = router;
