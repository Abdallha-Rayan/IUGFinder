const db = require('../config/db');

const createReport = (req, res) => {
    const {
        status,
        item_type,
        color,
        report_date,
        report_time,
        location,
        description
    } = req.body;

    const user_id = req.user.id; // جاي من التوكن

    if (!status || !item_type || !report_date || !report_time || !location) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    const sql = `
        INSERT INTO reports (status, item_type, color, report_date, report_time, location, description, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [status, item_type, color, report_date, report_time, location, description, user_id],
        (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            res.status(201).json({ message: 'Report created successfully', reportId: result.insertId });
        }
    );
};
const getReports = (req, res) => {
    const userId = req.user.id;  // احصل على id المستخدم من التوكن
    const userRole = req.user.role;  // احصل على دور المستخدم من التوكن

    // إذا كان المستخدم عاديًا، نعرض بلاغاته الخاصة فقط
    let sql = 'SELECT * FROM reports WHERE user_id = ?';  // جلب بلاغات المستخدم فقط

    if (userRole === 'admin') {
        // إذا كان المستخدم أدمن، نعرض جميع البلاغات
        sql = 'SELECT * FROM reports';
    }

    // تنفيذ الاستعلام
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        res.status(200).json({ message: 'Reports fetched successfully',length :results.length, reports: results });
    });
};
const getOtherUsersReports = (req, res) => {
    const userId = req.user.id; // نحصل على ID المستخدم من التوكن

    const sql = 'SELECT * FROM reports WHERE user_id != ?'; // استبعاد البلاغات التي أضافها نفس المستخدم

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        res.status(200).json({ reports: results });
    });
};
const getLostReportsOnly = (req, res) => {
    const sql = "SELECT * FROM reports WHERE status = 'مفقود' ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        res.status(200).json({ reports: results });
    });
};
const getExistingReportsOnly = (req, res) => {
    const sql = "SELECT * FROM reports WHERE status = 'موجود' ORDER BY created_at DESC";

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        res.status(200).json({ reports: results });
    });
};
const deleteReport = (req, res) => {
    const reportId = req.params.id;
    const user = req.user;

    // أولًا نتحقق من وجود البلاغ
    const findSql = 'SELECT * FROM reports WHERE id = ?';
    db.query(findSql, [reportId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });

        if (results.length === 0) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const report = results[0];

        // المستخدم العادي لا يمكنه حذف بلاغ ليس له
        if (user.role === 'user' && report.user_id !== user.id) {
            return res.status(403).json({ message: 'Access denied. You can only delete your own reports.' });
        }

        // الآن نحذف البلاغ
        const deleteSql = 'DELETE FROM reports WHERE id = ?';
        db.query(deleteSql, [reportId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            res.status(200).json({ message: 'Report deleted successfully' });
        });
    });
};

module.exports = { createReport , getReports , getOtherUsersReports,getLostReportsOnly,getExistingReportsOnly,deleteReport};
