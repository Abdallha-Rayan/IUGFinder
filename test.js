
// اختبار تشغيل الاشعارات 
(async () => {
    const { sendNotification } = require('./services/notificationService');
    await sendNotification(
      'cRxQSBAxQYS9O7EeZzohXt:APA91bH1_4KW7zEryCqIrL_aXd4D8ZEDhzqrDxiano6-sudryN-x1fHph4JsXTJUwEuAl-cX5Jag3-whlFnpaFwIVTpS3jB4LVGy28LaApUdrdBcJLM9cVI',
      'Test Notification',
      'This is a test message'
    );
  })();
  