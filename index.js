
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require('./routes/reportRoutes');
const globalErrorHandler = require('./controllers/error.control');
const AppError = require('./utils/appError');
const http = require('http');


const app = express();

// تفعيل CORS وتحليل البيانات
app.use(cors());
app.use(bodyParser.json());


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use("/api/notifications", notificationRoutes);

// معالجة المسارات الغير موجودة
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// معالج الأخطاء العالمي
app.use(globalErrorHandler);

// إنشاء السيرفر وتصديره
const server = http.createServer(app);
module.exports = server;