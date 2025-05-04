require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const http = require('http');  // إضافة هذا الاستيراد
const socketHandler = require('./config/socket');
const globaleErrorHandelar = require('./controllers/error.control')
const AppError = require('./utils/appErorr')

// إنشاء تطبيق Express
const app = express();

// إنشاء سيرفر HTTP
const server = http.createServer(app);

// تفعيل Socket.IO على السيرفر
const io = socketHandler(server);

const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// المسارات
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

app.all('*', (req, res,next) => {
  // res.status(404).json({
  //   status: 'fail',
  //   message: `Can't find this ${req.originalUrl} on this server ❌`,
  // });

  next( new AppError(`Can't find this ${req.originalUrl} on this server ❌`,404))
});

app.get('/', (req, res) => {
  res.send('API is running. Visit /api-docs for Swagger documentation.');
});

app.use(globaleErrorHandelar)
// تشغيل السيرفر باستخدام server.listen
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
