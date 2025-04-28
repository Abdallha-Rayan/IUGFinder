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
  const photo = req.file ? req.file.filename : null

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
      photo

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
      sql = `SELECT reports.*, users.full_name, users.id AS user_id
      FROM reports
      JOIN users ON reports.user_id = users.id`;
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
    return res
      .status(500)
      .json({ message: "Database error", error: error.message });
  }
};

const editreport = async (req, res) => {
  const reportId = req.params.id;
  const user = req.user;
  const {
    status,
    item_type,
    color,
    report_date,
    report_time,
    location,
    description,
  } = req.body;

  if (!reportId) {
    return res.status(404).json({ message: "Invalid ID Report ❌" });
  }

  try {
    const findSql = queryList.FIND_REPORT_BY_ID;
    const [results] = await db.query(findSql, [reportId]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Report not found" });
    }

    const report = results[0];

    // التحقق من أن المستخدم يمكنه تعديل هذا التقرير
    if (user.role === "user" && report.user_id !== user.id) {
      return res.status(403).json({
        message: "🚫 Access denied. You can only edit your own reports.",
      });
    }

    // إعداد الحقول التي سيتم تعديلها
    const updatedFields = [];
    const updateValues = [];

    // التحقق من الحقول المرسلة وتحديثها إذا كانت موجودة
    if (status) {
      updatedFields.push("status = ?");
      updateValues.push(status);
    }
    if (item_type) {
      updatedFields.push("item_type = ?");
      updateValues.push(item_type);
    }
    if (color) {
      updatedFields.push("color = ?");
      updateValues.push(color);
    }
    if (report_date) {
      updatedFields.push("report_date = ?");
      updateValues.push(report_date);
    }
    if (report_time) {
      updatedFields.push("report_time = ?");
      updateValues.push(report_time);
    }
    if (location) {
      updatedFields.push("location = ?");
      updateValues.push(location);
    }
    if (description) {
      updatedFields.push("description = ?");
      updateValues.push(description);
    }

    // التحقق من الصورة الجديدة
    if (req.file) {
      updatedFields.push("photo = ?");
      updateValues.push(req.file.filename);  // تعيين اسم الصورة الجديدة
    }

    // إذا لم يتم إرسال أي حقل للتحديث
    if (updatedFields.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    // إضافة شرط الـ WHERE في النهاية
    const updateSql = `UPDATE reports SET ${updatedFields.join(", ")} WHERE id = ?`;
    updateValues.push(reportId);  // إضافة الـ reportId كقيمة للـ WHERE

    // تنفيذ الاستعلام
    await db.query(updateSql, updateValues);

    res.status(200).json({
      message: "✅ Report updated successfully",
      Id_Report: reportId,
    });
  } catch (error) {
    console.error("Edit Report Error:", error);
    res.status(500).json({ message: "❌ Database error", error: error.message });
  }
};


module.exports = {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,
  getExistingReportsOnly,
  deleteReport,
  editreport,
};
