const express = require("express");
const router = express.Router();
const { sendNotification } = require("../services/notificationService");

// إرسال إشعار عند الطلب
router.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const result = await sendNotification(token, title, body);
  if (result.success) {
    return res.status(200).json({ message: "Notification sent successfully", response: result.response });
  } else {
    return res.status(500).json({ message: "Failed to send notification", error: result.error });
  }
});

module.exports = router;
