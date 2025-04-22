exports.queryList = {
  INSERT_NEW_USER_REGISTERED: ` INSERT INTO users (first_name, last_name, email, university_id, phone, password, role) VALUES (?, ?, ?, ?, ?, ?, 'user')`,
  CHECK_EMAIL_UNIVERSITY_ID_PHONE_lSQL:'SELECT * FROM users WHERE email = ? OR university_id = ? OR phone = ?',
  LOGIN:`SELECT * FROM users WHERE email = ?`,
  CREATE_NEW_REPORT :`INSERT INTO reports (status, item_type, color, report_date, report_time, location, description, user_id)  VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  GET_ALL_REPORTS : `SELECT * FROM reports WHERE user_id = ?`,
  GET_OTHER_USERS_REPORTS:'SELECT * FROM reports WHERE user_id != ?',
  GET_LOST_REPORTS_ONLY:`SELECT * FROM reports WHERE status = 'مفقود' ORDER BY created_at DESC`,
  GET_EXISTING_REPORTS_ONLY:`SELECT * FROM reports WHERE status = 'موجود' ORDER BY created_at DESC`,
  FIND_REPORT_BY_ID:`SELECT * FROM reports WHERE id = ?`,
  DELETE_REPORT:`DELETE FROM reports WHERE id = ?`
  
}
