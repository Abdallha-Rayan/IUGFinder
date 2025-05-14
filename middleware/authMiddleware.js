const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    // console.log('📦 Received Token:', token); // <-- سطر مفيد للتصحيح

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

const checkAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            console.error('⚠️ لم يتم العثور على بيانات المستخدم في الطلب');
            return res.status(403).json({
                success: false,
                message: 'بيانات المصادقة غير مكتملة'
            });
        }

        if (req.user.role !== 'admin') {
            console.warn('⛔ محاولة وصول غير مصرح بها من:', {
                userId: req.user.id,
                userRole: req.user.role
            });
            
            return res.status(403).json({
                success: false,
                message: 'غير مسموح: صلاحيات مسؤول مطلوبة',
                your_role: req.user.role,
                required_role: 'admin'
            });
        }

        console.log('🎯 تم التحقق من صلاحية الأدمن للمستخدم:', req.user.id);
        next();
    } catch (err) {
        console.error('🔥 خطأ غير متوقع في التحقق من الصلاحيات:', err);
        return res.status(500).json({
            success: false,
            message: 'خطأ داخلي في التحقق من الصلاحيات'
        });
    }
};

module.exports = {
    verifyToken,
    checkAdmin
};

// module.exports = {verifyToken,checkAdmin};

