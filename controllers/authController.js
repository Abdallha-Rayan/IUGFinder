const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { queryList } = require('../DB/queryes');
const { hashPassword } = require('../utils/hash');


const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password)
        return res.status(400).json({ message: 'Email and password are required' });

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (results.length === 0)
            return res.status(401).json({ message: 'Invalid email or password' });

        const user = results[0];

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    name: `${user.first_name} ${user.last_name}`,
                    role: user.role,
                    email: user.email
                }
            });
        } catch (error) {
            return res.status(500).json({ message: 'Error comparing password', error });
        }
    });
};

const register = async (req, res) => {
    const { first_name, last_name, email, university_id, phone, password, confirmPassword } = req.body;

    // 1. التحقق من البيانات
    if (!first_name || !last_name || !email || !university_id || !phone || !password || !confirmPassword) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // 2. التحقق من تطابق كلمة المرور
    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        // 3. التحقق من وجود الإيميل أو الرقم الجامعي مسبقًا
        const checkSql = queryList.CHECK_EMAIL_UNIVERSITY_ID_PHONE_lSQL;
        db.query(checkSql, [email, university_id, phone], async (err, results) => {
            if (err) return res.status(500).json({ message: 'Database error', error: err });

            // if (results.length > 0) {
            //     return res.status(409).json({ message: 'Email or university , Phone ID already in use' });
            // }
            if (results.length > 0) {
                const existing = results[0];
                if (existing.email === email)
                    return res.status(409).json({ message: 'Email already in use 👈🏻' });
                if (existing.university_id === university_id)
                    return res.status(409).json({ message: 'University ID already in use 👈🏻' });
                if (existing.phone === phone)
                    return res.status(409).json({ message: 'Phone number already in use 👈🏻' });
            }

            // 4. تشفير كلمة المرور
            const hashedPassword = await hashPassword(password);

            // 5. إدخال المستخدم
            const insertNewUserSql =queryList.INSERT_NEW_USER_REGISTERED

            db.query(
                insertNewUserSql,
                [first_name, last_name, email, university_id, phone, hashedPassword],
                (err, result) => {
                    if (err) return res.status(500).json({ message: 'Database error ❌', error: err });

                    res.status(201).json({ message: 'User registered successfully ✅' });
                }
            );
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { login, register };

