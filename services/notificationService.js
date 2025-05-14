const admin = require("../config/firebase");

// إرسال إشعار إلى جهاز واحد
const sendNotification = async (deviceToken, title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: deviceToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("✅ Notification sent successfully:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Error sending notification:", error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendNotification };
