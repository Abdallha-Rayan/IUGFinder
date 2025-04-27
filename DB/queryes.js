exports.queryList = {
  INSERT_NEW_USER_REGISTERED: `INSERT INTO users (full_name, email, university_id, phone, password, photo, role)
  VALUES (?, ?, ?, ?, ?, ?, 'user')`,
  CHECK_EMAIL_UNIVERSITY_ID_PHONE_lSQL:'SELECT * FROM users WHERE email = ? OR university_id = ? OR phone = ?',
  LOGIN:`SELECT * FROM users WHERE email = ?`,
  CREATE_NEW_REPORT :`INSERT INTO reports (status, item_type, color, report_date, report_time, location, description, user_id, photo)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
  GET_ALL_REPORTS : `SELECT reports.*, users.full_name, users.id AS user_id
  FROM reports
  JOIN users ON reports.user_id = users.id
  WHERE reports.user_id = ?`,
  GET_OTHER_USERS_REPORTS: `SELECT reports.*, users.full_name, users.id AS user_id
  FROM reports
  JOIN users ON reports.user_id = users.id
  WHERE reports.user_id != ?;
  `,
  GET_LOST_REPORTS_ONLY:`SELECT reports.*, users.full_name, users.id AS user_id
  FROM reports
  JOIN users ON reports.user_id = users.id
  WHERE reports.status = 'مفقود'
  ORDER BY reports.created_at DESC;
  `,
  GET_EXISTING_REPORTS_ONLY:`SELECT reports.*, users.full_name, users.id AS user_id
  FROM reports
  JOIN users ON reports.user_id = users.id
  WHERE reports.status = 'موجود'
  ORDER BY reports.created_at DESC;
  `,
  FIND_REPORT_BY_ID:`SELECT * FROM reports WHERE id = ?`,
  DELETE_REPORT:`DELETE FROM reports WHERE id = ?`,
  UPDATE_REPORT_BY_ID: `UPDATE reports SET 
    status = ?, 
    item_type = ?, 
    color = ?, 
    report_date = ?, 
    report_time = ?, 
    location = ?, 
    description = ?,
    photo = ?  -- إضافة تحديث الصورة
  WHERE id = ?;
  `,
  FIND_USER_BY_ID: 'SELECT * FROM users WHERE id = ?',

  
}
