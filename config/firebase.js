const admin = require("firebase-admin");
const path = require("path");

// تحميل ملف JSON الذي تم تنزيله من Firebase Console
const serviceAccount = require(path.join(__dirname, "iug-finder-firebase-adminsdk-fbsvc-d65f6034bb.json"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase initialized successfully");
}

module.exports = admin;
