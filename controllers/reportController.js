const db = require("../config/db");
const catchAsync = require("../utils/catchAsync");
const appError = require("../utils/appError");
const { queryList } = require("../DB/queryes");
const AppError = require("../utils/appError");
const { sendNotification } = require("../services/notificationService");


const createReport = catchAsync(async (req, res) => {
  const {
    status,
    item_type,
    color,
    report_date,
    report_time,
    location,
    description,
  } = req.body;
  const photo = req.file ? req.file.filename : null;

  const user_id = req.user.id;

  if (!status || !item_type || !report_date || !report_time || !location) {
    return res.status(400).json({ message: "Missing required fields" });
  }
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
    photo,
  ]);
  res.status(201).json({
    message: "Report created successfully",
    reportId: results.insertId,
  });
  // try {
  // } catch (error) {
  //   return res.status(500).json({ message: "Database error", error: error });
  // }
});
const getReports = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  let sql;
  let values = [];

  if (userRole === "admin") {
    sql = `SELECT reports.*, users.full_name, users.id AS user_id
    FROM reports
    JOIN users ON reports.user_id = users.id`;
  } else {
    sql = `${queryList.GET_ALL_REPORTS} ORDER BY created_at DESC`; // لازم يكون فيه شرط WHERE user_id = ?
    values = [userId];
  }

  const [results] = await db.query(sql, values);

  res.status(200).json({
    message: "Reports fetched successfully",
    length: results.length,
    reports: results,
  });
  // try {
  // } catch (err) {
  //   return res.status(500).json({ message: "Database error", error: error });
  // }
});
const getOtherUsersReports = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const sql = queryList.GET_OTHER_USERS_REPORTS;
  const [results] = await db.query(sql, [userId]);
  res.status(200).json({ reports: results });
  // try {
  // } catch (error) {
  //   return res.status(500).json({ message: "Database error", error: error });
  // }
});
const getLostReportsOnly = catchAsync(async (req, res) => {
  const sql = queryList.GET_LOST_REPORTS_ONLY;
  const [results] = await db.query(sql);
  res.status(200).json({ reports: results });
  // try {
  // } catch (error) {
  //   return res.status(500).json({ message: "Database error", error: error });
  // }
});
const getExistingReportsOnly = catchAsync(async (req, res) => {
  try {
    const sql = queryList.GET_EXISTING_REPORTS_ONLY;
    const [results] = await db.query(sql);
    res.status(200).json({ reports: results });
  } catch (error) {
    return res.status(500).json({ message: "Database error", error: error });
  }
});
const deleteReport = catchAsync(async (req, res, next) => {
  const reportId = req.params.id;
  const user = req.user;

  const findSql = queryList.FIND_REPORT_BY_ID;
  const [results] = await db.query(findSql, [reportId]);

  if (results.length === 0) {
    return next(new AppError("Report not found", 404));
  }

  const report = results[0];

  if (user.role === "user" && report.user_id !== user.id) {
    return next(
      new AppError("Access denied. You can only delete your own reports.", 403)
    );
  }

  const deleteSql = queryList.DELETE_REPORT;
  await db.query(deleteSql, [reportId]);

  res.status(200).json({ message: "Report deleted successfully" });
  // try {
  // } catch (error) {
  //   return res
  //     .status(500)
  //     .json({ message: "Database error", error: error.message });
  // }
});
const editreport = catchAsync(async (req, res, next) => {
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
    return next(new AppError("Invalid ID Report ❌", 404));
  }

  const findSql = queryList.FIND_REPORT_BY_ID;
  const [results] = await db.query(findSql, [reportId]);
  if (results.length === 0) {
    return res.status(404).json({ message: "Report not found" });
  }

  const report = results[0];

  // التحقق من أن المستخدم يمكنه تعديل هذا التقرير
  if (user.role === "user" && report.user_id !== user.id) {
    return next(
      new AppError("🚫 Access denied. You can only edit your own reports.", 403)
    );
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
    updateValues.push(req.file.filename); // تعيين اسم الصورة الجديدة
  }

  // إذا لم يتم إرسال أي حقل للتحديث
  if (updatedFields.length === 0) {
    return next(new AppError("No fields to update", 400));
  }

  // إضافة شرط الـ WHERE في النهاية
  const updateSql = `UPDATE reports SET ${updatedFields.join(
    ", "
  )} WHERE id = ?`;
  updateValues.push(reportId); // إضافة الـ reportId كقيمة للـ WHERE

  // تنفيذ الاستعلام
  await db.query(updateSql, updateValues);

  res.status(200).json({
    message: "✅ Report updated successfully",
    Id_Report: reportId,
  });
  // try {
  // } catch (error) {
  //   console.error("Edit Report Error:", error);
  //   res.status(500).json({ message: "❌ Database error", error: error.message });
  // }
});

const getMatchingReports = catchAsync(async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "غير مسموح: صلاحيات غير كافية" });
  }
  const [lostReports] = await db.query(queryList.SELECT_REPORTS_STATUS_LOST);

  const matchedPairs = [];

  for (const lostReport of lostReports) {
    const [foundReports] = await db.query(
      queryList.SELECT_REPORTS_STATUS_LOST_FOUND,
      [lostReport.item_type, lostReport.color]
    );
    if (foundReports.length > 0) {
      matchedPairs.push({
        lost: lostReport,
        found: foundReports[0],
      });
    }
  }
  res.status(200).json({
    success: true,
    data: matchedPairs,
  });
  // try {

  // } catch (error) {
  //   console.error('Error in getMatchingReports:', error);
  //   res.status(500).json({
  //     success: false,
  //     message: 'فشل جلب البلاغات المتطابقة'
  //   });
  // }
});



// const updateReportStatus = catchAsync( async  (req, res)=> {
//   const reportId = req.params.id;
//   const {full_name, phone } = req.body;

//   // تحديث حالة البلاغ في قاعدة البيانات
//   await db.query("UPDATE reports SET status = 'موجود' WHERE id = ?", [reportId]);

//   // جلب بيانات صاحب البلاغ من قاعدة البيانات
//   const [report] = await db.query("SELECT user_id FROM reports WHERE id = ?", [reportId]);
//   if (report.length === 0) {
//     return res.status(404).json({ message: "Report not found" });
//   }

//   const ownerId = report[0].user_id;
//   const [owner] = await db.query("SELECT devices_token FROM users WHERE id = ?", [ownerId]);

//   if (owner.length > 0) {
//     const notificationMessage = `Your lost item has been found! Contact: ${full_name} (Phone: ${phone}).`;
//     await sendNotification(owner[0].devices_token, "Lost Item Found", notificationMessage);
//   }

//   res.status(200).json({ message: "Report status updated and owner notified successfully" });
//   // try {
//   // } catch (error) {
//   //   console.error("Error updating report:", error);
//   //   res.status(500).json({ message: "Error updating report" });
//   // }
// })


const updateReportStatus = catchAsync(async (req, res) => {
  const reportId = req.params.id;
  const { full_name, phone } = req.body;
  console.log('reportId',reportId,'Full Name' , full_name,'phone',phone);

  if (!full_name || !phone) {
    return res.status(400).json({ message: "Full name and phone are required" });
  }

  // تحديث حالة البلاغ في قاعدة البيانات
  await db.query("UPDATE reports SET status = 'موجود' WHERE id = ?", [reportId]);

  // جلب بيانات صاحب البلاغ من قاعدة البيانات
  const [report] = await db.query("SELECT user_id FROM reports WHERE id = ?", [reportId]);
  if (report.length === 0) {
    return res.status(404).json({ message: "Report not found" });
  }

  const ownerId = report[0].user_id;
  const [owner] = await db.query("SELECT devices_token FROM users WHERE id = ?", [ownerId]);

  if (owner.length > 0) {
    const notificationMessage = `Your lost item has been found! Contact: ${full_name} (Phone: ${phone}).`;
    await sendNotification(owner[0].devices_token, "Lost Item Found", notificationMessage);
  }

  res.status(200).json({ message: "Report status updated and owner notified successfully" });
  // try {
  // } catch (error) {
  //   console.error("Error updating report:", error);
  //   res.status(500).json({ message: "Error updating report" });
  // }
});

module.exports = { updateReportStatus };

module.exports = {
  createReport,
  getReports,
  getOtherUsersReports,
  getLostReportsOnly,
  getExistingReportsOnly,
  deleteReport,
  editreport,
  getMatchingReports,
  updateReportStatus
};





