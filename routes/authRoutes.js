
const express = require('express');
const upload = require('../utils/uploadImage');
const {verifyToken} = require("../middleware/authMiddleware");
const router = express.Router();
const { login, register ,getDataUserById,updateUser,saveDeviceToken} = require('../controllers/authController');

router
  .get('/user/:id', verifyToken,getDataUserById)
  .put('/user/:id',verifyToken,upload.single('photo'),updateUser);
router
.post('/login', login)
.post('/devicetoken', saveDeviceToken)
.post('/register', upload.single('photo'), register); 


module.exports = router;

