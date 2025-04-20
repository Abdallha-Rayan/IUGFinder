const express = require("express");
const router = express.Router();
const {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,getExistingReportsOnly,deleteReport
} = require("../controllers/reportController");
const verifyToken = require("../middleware/authMiddleware");

// 🔐 هذا المسار محمي بالتوكن
router
  .delete("/:id", verifyToken, deleteReport);
router
  .post("/", verifyToken, createReport)
  .get("/", verifyToken, getReports)
  .get("/other", verifyToken, getOtherUsersReports)
  .get("/lost", verifyToken, getLostReportsOnly)
  .get("/existing", verifyToken, getExistingReportsOnly);

module.exports = router;
