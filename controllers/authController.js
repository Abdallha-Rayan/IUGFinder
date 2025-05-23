const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { queryList } = require("../DB/queryes");
const { hashPassword } = require("../utils/hash");
const { query } = require("../config/db");
const catchAsync = require("../utils/catchAsync");


const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });
  const sql = queryList.LOGIN;

  const [results] = await db.query(sql, [email]);
  if (results.length === 0)
    return res.status(401).json({ message: "Invalid email or password" });

  const user = results[0];
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return res.status(401).json({ message: "Invalid email or password" });

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  res.status(200).json({
    message: "Login successful",
    user: {
      id: user.id,
      name: user.full_name,
      role: user.role,
      email: user.email,
      token: token,
      university_id: user.university_id,
      phone: user.phone,
    },
  });
  // try {
  // } catch (error) {
  //   console.error("Error during login:", error);
  //   return res
  //     .status(500)
  //     .json({ message: "Server error", error: error.message });
  // }
});
const saveDeviceToken = catchAsync(async (req, res) => {
  const {userId, deviceToken} = req.body ;
  console.log(userId,deviceToken);
  if(!userId ||!deviceToken){
    return res.status(400).json({message:'Email and password are required'})
  }
  const sql = queryList.INSERT_DEVICE_TOKEN
  await db.query(sql,[userId,deviceToken])
  res.status(200).json({message:'successfully ✅'})

});
const register = catchAsync(async (req, res) => {
  const { full_name, email, university_id, phone,devices_token, password, confirmPassword } =
    req.body;
  const photo = req.file ? req.file.filename : null; // التأكد من رفع صورة

  if (
    !full_name ||
    !email ||
    !university_id ||
    !phone ||
    !password ||
    !confirmPassword
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  const checkSql = queryList.CHECK_EMAIL_UNIVERSITY_ID_PHONE_lSQL;
  const [results] = await db.query(checkSql, [email, university_id, phone]);

  if (results.length > 0) {
    const existing = results[0];
    if (existing.email === email)
      return res.status(409).json({ message: "Email already in use 👈🏻" });
    if (existing.university_id === university_id)
      return res
        .status(409)
        .json({ message: "University ID already in use 👈🏻" });
    if (existing.phone === phone)
      return res
        .status(409)
        .json({ message: "Phone number already in use 👈🏻" });
  }

  const hashedPassword = await hashPassword(password);

  const insertNewUserSql = queryList.INSERT_NEW_USER_REGISTERED;

  await db.query(insertNewUserSql, [
    full_name,
    email,
    university_id,
    phone,
    devices_token,
    hashedPassword,
    photo,
  ]);

  res.status(201).json({ message: "User registered successfully ✅" });
  // try {
  // } catch (err) {
  //   console.error("❌ Database error:", err);
  //   res.status(500).json({ message: "Server error" });
  // }
});

const getDataUserById =catchAsync( async (req, res) => {
  const ID_USER = req.params.id;
  const checkSql = queryList.FIND_USER_BY_ID;
  const [results] = await db.query(checkSql, [ID_USER]);
  if(parseInt(ID_USER)!== req.user.id){
    return res.status(400).json({message:'Access denied. You can only view your own data.'})
  }
  if (results.length === 0) {
    return res.status(404).json({
      message: "User not found",
    });
  }
  const { password, ...userWithoutPassword } = results[0];

  res.status(200).json({ user: userWithoutPassword });
  // try {
  // } catch (error) {
  //   console.error('❌ Database error:', error.message);  // طباعة تفاصيل الخطأ
  //   res.status(500).json({ message: 'Server error', error: error.message });
  // }
});
const updateUser = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const { full_name, email, phone, password, devices_token } = req.body || {}; // التأكد من وجود الحقول المرسلة

  if (!userId) {
    return res.status(404).json({ message: "Invalid ID User ❌" });
  }
  console.log('Request Body:', req.body); // تحقق من محتويات الجسم المرسل
  console.log('req.user.id', req.user.id, 'userId', userId);

  const findUser = queryList.FIND_USER_BY_ID;
  const [results] = await db.query(findUser, [userId]);
  if (results.length === 0) {
    return res.status(404).json({ message: 'Invalid ID User ❌' });
  }

  const user = results[0];
  // التحقق من أن المستخدم يملك الصلاحية لتحديث نفسه
  if (user.id !== userId * 1) {
    return res.status(403).json({ message: "You are not authorized to update this user" });
  }

  // بناء استعلام التحديث حسب الحقول المرسلة فقط
  const updateFields = [];
  const updateValues = [];

  // التحقق من الحقول المرسلة وتحديد ما سيتم تحديثه
  if (full_name) {
    updateFields.push("full_name = ?");
    updateValues.push(full_name);
  }
  if (email) {
    updateFields.push("email = ?");
    updateValues.push(email);
  }
  if (phone) {
    updateFields.push("phone = ?");
    updateValues.push(phone);
  }
  if (req.file) {
    updateFields.push("photo = ?");
    updateValues.push(req.file.filename);
  }
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    updateFields.push("password = ?");
    updateValues.push(hashedPassword);
  }
  if (devices_token) {
    updateFields.push("devices_token = ?");
    updateValues.push(devices_token);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }

  updateValues.push(userId);
  // إنشاء استعلام التحديث
  const updateSql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
  await db.query(updateSql, updateValues);

  // الرد على المستخدم بعد نجاح التحديث
  res.status(200).json({ message: "User updated successfully ✅", userID: userId });
});







module.exports = { login, register,getDataUserById ,updateUser,saveDeviceToken };
