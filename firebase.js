const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
const { getStorage } = require("firebase-admin/storage");

const serviceAccount = require("./keyFirebase.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: "kalyangcg.appspot.com"
    });
}

const db = getFirestore();
const bucket = admin.storage().bucket("KalyanDB");


module.exports = { db, bucket };

