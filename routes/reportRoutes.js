const express = require("express");
const router = express.Router();
const upload = require('../utils/uploadImage');


const {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,getExistingReportsOnly,deleteReport,editreport,getMatchingReports,updateReportStatus
} = require("../controllers/reportController");
const {verifyToken,checkAdmin} = require("../middleware/authMiddleware");

router
  .delete("/:id", verifyToken, deleteReport)
  .put("/:id", verifyToken, upload.single('photo'),editreport)
router
  .post("/", verifyToken, upload.single('photo'),createReport)
  .get("/", verifyToken, getReports)
  .get("/other", verifyToken, getOtherUsersReports)
  .get("/lost", verifyToken, getLostReportsOnly)
  .get("/existing", verifyToken, getExistingReportsOnly);

router.get('/matched-reports', verifyToken,checkAdmin, getMatchingReports);
router.post("/:id/found", verifyToken, updateReportStatus);;


module.exports = router;
