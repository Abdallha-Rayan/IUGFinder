const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { queryList } = require("../DB/queryes");
const { hashPassword } = require("../utils/hash");
const { query } = require("../config/db");

// const login = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password)
//     return res.status(400).json({ message: "Email and password are required" });
//   const sql = queryList.LOGIN;

//   try {
//     const [results] = await db.query(sql, [email]);
//     if (results.length === 0)
//       return res.status(401).json({ message: "Invalid email or password" });

//     const user = results[0];
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch)
//       return res.status(401).json({ message: "Invalid email or password" });

//     const token = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );
//     res.status(200).json({
//       message: "Login successful",
//       user: {
//         id: user.id,
//         name: user.full_name,
//         role: user.role,
//         email: user.email,
//         token: token,
//         university_id: user.university_id,
//         phone: user.phone,
//       },
//     });
//   } catch (error) {
//     console.error("Error during login:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Email and password are required" });

  const sql = queryList.LOGIN;

  try {
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

    // 1. إضافة إشعار إلى قاعدة البيانات
    const notificationMessage = 'Welcome back!';
    const notificationSql = 'INSERT INTO notifications (user_id, message) VALUES (?, ?)';
    
    await db.query(notificationSql, [user.id, notificationMessage]);

    // 2. إرسال إشعار باستخدام Socket.IO
    const userSocketId = req.userSockets[user.id];  // الحصول على socket.id للمستخدم
    if (userSocketId) {
      req.io.to(userSocketId).emit('loginNotification', {
        message: notificationMessage,  // الرسالة التي ستظهر للمستخدم
      });
    }

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
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


const register = async (req, res) => {
  const { full_name, email, university_id, phone, password, confirmPassword } =
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

  try {
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
      hashedPassword,
      photo,
    ]);

    res.status(201).json({ message: "User registered successfully ✅" });
  } catch (err) {
    console.error("❌ Database error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getDataUserById = async (req, res) => {
  const ID_USER = req.params.id;
  try {
    const checkSql = queryList.FIND_USER_BY_ID;
    const [results] = await db.query(checkSql, [ID_USER]);


    if (results.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }
    const { password, ...userWithoutPassword } = results[0];

    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error('❌ Database error:', error.message);  // طباعة تفاصيل الخطأ
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
const updateUser = async (req, res) => {
  const userId = req.params.id ;
  const { full_name, email, phone,password } = req.body || {}; // التأكد من وجود الحقول التي قد تم إرسالها
  if(!userId){
   return res.status(404).json({ message:"Invalid ID User ❌"})
  }
  console.log('Request Body:', req.body); // تحقق من محتويات الجسم المرسل
  console.log('req.user.id', req.user.id, 'userId', userId);

  
  
  try {
    const findUser = queryList.FIND_USER_BY_ID
    const [results] = await db.query(findUser,[userId])
      if(results.length === 0){
        return res.status(404).json({message:'Invalid ID User ❌'})
      }
    const user = results[0]
    // التأكد من أن التوكن المرتبط بالطلب هو نفس التوكن الخاص بالمستخدم الذي يريد التعديل
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
  if (updateFields.length === 0) {
    return res.status(400).json({ message: "No fields to update" });
  }
  updateValues.push(userId);
  // إنشاء الاستعلام
  const updateSql = `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`;
    await db.query(updateSql, updateValues);

    // الرد على المستخدم بعد نجاح التحديث
    res.status(200).json({ message: "User updated successfully ✅", userID :userId});
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { login, register,getDataUserById ,updateUser };
