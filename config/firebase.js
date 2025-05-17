const admin = require("firebase-admin");
const path = require("path");

const serviceAccount = require(path.join(__dirname, "iug-finder-firebase-adminsdk-fbsvc-d65f6034bb.json"));

// تحقق مما إذا كان هناك تطبيق Firebase مهيأ مسبقًا
if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Firebase Admin SDK initialized successfully");
}

module.exports = admin;