exports.queryList = {
  INSERT_NEW_USER_REGISTERED: ` INSERT INTO users (first_name, last_name, email, university_id, phone, password, role) VALUES (?, ?, ?, ?, ?, ?, 'user')`,
  CHECK_EMAIL_UNIVERSITY_ID_PHONE_lSQL:'SELECT * FROM users WHERE email = ? OR university_id = ? OR phone = ?'
};
