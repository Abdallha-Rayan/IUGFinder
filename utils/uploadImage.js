const multer = require('multer');
const path = require('path');

// تعريف الـ storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // تحديد مجلد التحميل
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname); // استخراج امتداد الصورة
    cb(null, uniqueName + ext); // تحديد اسم الملف
  }
});

// فلترة الملفات لقبول الصور فقط
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // مقبول
  } else {
    cb(new Error('Only images are allowed!'), false); // مرفوض
  }
};

// إعداد multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // تحديد الحجم الأقصى للملف (5MB)
});

module.exports = upload;
