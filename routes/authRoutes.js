
const express = require('express');
const upload = require('../utils/uploadImage');
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const { login, register ,getDataUserById} = require('../controllers/authController');

router.get('/user/:id', verifyToken,getDataUserById);
router.post('/login', login);
router.post('/register', upload.single('photo'), register); 

module.exports = router;

