const express = require('express');
const router = express.Router();
const  {login,register}  = require('../controllers/authController');

// تأكد من أن المسار يستخدم /login بشكل صحيح
router.post('/login', login);
router.post('/register', register);  // ⬅️ تسجيل مستخدم

module.exports = router;
