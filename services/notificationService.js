const admin = require("../config/firebase");

const sendNotification = async (deviceToken, title, body) => {
  if (!deviceToken) {
    console.error("❌ Device token is missing");
    return { success: false, error: "Device token is required" };
  }

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