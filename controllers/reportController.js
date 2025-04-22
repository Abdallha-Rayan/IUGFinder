const db = require("../config/db");
const { queryList } = require("../DB/queryes");

const createReport = async (req, res) => {
  const {
    status,
    item_type,
    color,
    report_date,
    report_time,
    location,
    description,
  } = req.body;

  const user_id = req.user.id;

  if (!status || !item_type || !report_date || !report_time || !location) {
    return res.status(400).json({ message: "Missing required fields" });
  }
  try {
    const sql = queryList.CREATE_NEW_REPORT;
    const [results] = await db.query(sql, [
      status,
      item_type,
      color,
      report_date,
      report_time,
      location,
      description,
      user_id,
    ]);
    res.status(201).json({
      message: "Report created successfully",
      reportId: results.insertId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
  }
};

const getReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let sql;
    let values = [];

    if (userRole === "admin") {
      sql = "SELECT * FROM reports";
    } else {
      sql = queryList.GET_ALL_REPORTS; // لازم يكون فيه شرط WHERE user_id = ?
      values = [userId];
    }

    const [results] = await db.query(sql, values);

    res.status(200).json({
      message: "Reports fetched successfully",
      length: results.length,
      reports: results,
    });
  } catch (err) {
    return res.status(500).json({ message: "Database error", error: error });
  }
};

const getOtherUsersReports = async (req, res) => {
  try {
    const userId = req.user.id;
    const sql = queryList.GET_OTHER_USERS_REPORTS;
    const [results] = await db.query(sql, [userId]);
    res.status(200).json({ reports: results });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
  }
};
const getLostReportsOnly = async (req, res) => {
  try {
    const sql = queryList.GET_LOST_REPORTS_ONLY;
    const [results] = await db.query(sql);
    res.status(200).json({ reports: results });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
  }
};
const getExistingReportsOnly = async (req, res) => {
  try {
    const sql = queryList.GET_EXISTING_REPORTS_ONLY;
    const [results] = await db.query(sql);
    res.status(200).json({ reports: results });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
  }
};
const deleteReport = async (req, res) => {
    const reportId = req.params.id;
    const user = req.user;
  
    try {
      const findSql = queryList.FIND_REPORT_BY_ID;
      const [results] = await db.query(findSql, [reportId]);
  
      if (results.length === 0) {
        return res.status(404).json({ message: "Report not found" });
      }
  
      const report = results[0];
  
      // المستخدم العادي لا يمكنه حذف بلاغ ليس له
      if (user.role === "user" && report.user_id !== user.id) {
        return res.status(403).json({
          message: "Access denied. You can only delete your own reports.",
        });
      }
  
      // الآن نحذف البلاغ
      const deleteSql = queryList.DELETE_REPORT;
      await db.query(deleteSql, [reportId]);
  
      res.status(200).json({ message: "Report deleted successfully" });
    } catch (error) {
      return res.status(500).json({ message: "Database error", error: error.message });
    }
  };
  

module.exports = {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,
  getExistingReportsOnly,
  deleteReport,
};
