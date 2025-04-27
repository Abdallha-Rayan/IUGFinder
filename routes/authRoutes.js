
const express = require('express');
const upload = require('../utils/uploadImage');
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const { login, register ,getDataUserById,updateUser} = require('../controllers/authController');

router
  .get('/user/:id', verifyToken,getDataUserById)
  .put('/user/:id',verifyToken,updateUser);
router
.post('/login', login)
.post('/register', upload.single('photo'), register); 


module.exports = router;

