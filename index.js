// // require('dotenv').config();
// // const express = require('express');
// // const bodyParser = require('body-parser');
// // const cors = require('cors');
// // const swaggerUi = require('swagger-ui-express');
// // const swaggerDocument = require('./swagger.json');
// // const authRoutes = require('./routes/authRoutes');
// // const reportRoutes = require('./routes/reportRoutes');
// // const http = require('http');  // إضافة هذا الاستيراد
// // const socketHandler = require('./config/socket');
// // const globalErrorHandler = require('./controllers/error.control')
// // const AppError = require('./utils/appErorr')

// // // إنشاء تطبيق Express
// // const app = express();

// // // إنشاء سيرفر HTTP
// // const server = http.createServer(app);

// // // تفعيل Socket.IO على السيرفر
// // const io = socketHandler(server);

// // const PORT = 3000;

// // app.use(cors());
// // app.use(bodyParser.json());

// // // المسارات
// // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// // app.use('/api/auth', authRoutes);
// // app.use('/api/reports', reportRoutes);

// // app.all('*',(req,res,next)=>{
// //   // res.status(404).json({
// //   //   status:'fail',
// //   //   message:`Cont find ${req.originalUrl} on this server!`
// //   // })

// //   next(new AppError(`Cont find ${req.originalUrl} on this server!`,404))
// // })
// // // app.get('/', (req, res) => {
// // //   res.send('API is running. Visit /api-docs for Swagger documentation.');
// // // });

// // app.use((err, req, res, next) => {
// //   err.statusCode = err.statusCode || 500;
// //   err.status = err.status || 'error';

// //   res.status(err.statusCode).json({
// //     status: err.status,
// //     message: err.message
// //   });
// // });
// // // app.use(globalErrorHandler)
// // // تشغيل السيرفر باستخدام server.listen
// // server.listen(PORT, () => {
// //   console.log(`🚀 Server running on http://localhost:${PORT}`);
// // });

// require('dotenv').config();
// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const swaggerUi = require('swagger-ui-express');
// const swaggerDocument = require('./swagger.json');
// const authRoutes = require('./routes/authRoutes');
// const reportRoutes = require('./routes/reportRoutes');
// const globalErrorHandler = require('./controllers/error.control');
// const AppError = require('./utils/appError');

// // إنشاء تطبيق Express
// const app = express();

// // تفعيل CORS وتحليل البيانات
// app.use(cors());
// app.use(bodyParser.json());

// // تعريف المسارات
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
// app.use('/api/auth', authRoutes);
// app.use('/api/reports', reportRoutes);

// // معالجة المسارات الغير موجودة
// app.all('*', (req, res, next) => {
//   next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// // معالج الأخطاء العالمي
// app.use(globalErrorHandler);

// // تصدير التطبيق لاستخدامه في `server.js`
// module.exports = app;
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const globalErrorHandler = require('./controllers/error.control');
const AppError = require('./utils/appError');
const http = require('http');

// إنشاء تطبيق Express
const app = express();

// تفعيل CORS وتحليل البيانات
app.use(cors());
app.use(bodyParser.json());

// تعريف المسارات
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);

// معالجة المسارات الغير موجودة
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// معالج الأخطاء العالمي
app.use(globalErrorHandler);

// إنشاء السيرفر وتصديره
const server = http.createServer(app);
module.exports = server;