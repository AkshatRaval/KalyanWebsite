const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
const { Readable } = require("stream");
const Razorpay = require("razorpay");

// Custom modules
const generatePDF = require("../generatePDF");
const uploadFileToDrive = require("../uploadFileToDrive");
const sendPaymentConfirmationEmail = require("./sendPaymentEmail"); // ✅ Adjust path if needed

// Multer for memory-based file upload
const upload = multer({ storage: multer.memoryStorage() });

// Razorpay setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

// Add this route at the bottom of the file
router.post("/create-order", async (req, res) => {
  try {
    const amount = 100; // Amount in paise (₹300)
    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      payment_capture: 1
    });
    res.json({ key: process.env.RAZORPAY_KEY_ID, order });
  } catch (error) {
    res.status(500).json({ error: "Order creation failed" });
  }
});

// Google API setup
const auth = new google.auth.GoogleAuth({
  keyFile: "keyGoogle.json",
  scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"]
});

const drive = google.drive({ version: "v3", auth });
const sheets = google.sheets({ version: "v4", auth });
const SHEET_ID = process.env.SHEET_ID;

// Submit route
router.post("/submit", upload.any(), async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, email, mobile,
      whatsapp, aadhaar, fatherIncome, address, city, state,
      pincode, schoolName, schoolAddress, schoolCity,
      schoolType, schoolBoard, schoolMedium, lastMarks, stream,
      careerAspirations, payment_id
    } = req.body;

    const files = req.files;
    if (!aadhaar) return res.status(400).json({ success: false, error: "Aadhaar is required." });

    const payment = await razorpay.payments.fetch(payment_id);
    if (payment.status !== "captured") {
      return res.status(400).json({ success: false, error: "Payment not verified." });
    }

    const folderResponse = await drive.files.create({
      requestBody: { name: aadhaar, mimeType: "application/vnd.google-apps.folder" },
      fields: "id"
    });

    await drive.permissions.create({
      fileId: folderResponse.data.id,
      requestBody: { role: "reader", type: "anyone" }
    });

    const folderId = folderResponse.data.id;

    const fileUploadPromises = files.map(file => {
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      return drive.files.create({
        requestBody: { name: file.originalname, parents: [folderId] },
        media: { mimeType: file.mimetype, body: stream }
      }).then(res => `https://drive.google.com/file/d/${res.data.id}/view`);
    });

    const fileUrls = await Promise.all(fileUploadPromises);

    const userData = {
      aadhaar,
      name: `${firstName} ${middleName} ${lastName}`,
      email, mobile, whatsapp,
      fatherIncome, address, city, state, pincode,
      schoolName, schoolAddress, schoolCity,
      schoolType, schoolBoard, schoolMedium, lastMarks, stream, careerAspirations
    };

    const pdfPath = await generatePDF(userData);
    const pdfUrl = await uploadFileToDrive(pdfPath, `${aadhaar}_application.pdf`, folderId);
    fs.unlinkSync(pdfPath);

    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [[
          aadhaar, userData.name, email, mobile, whatsapp,
          fatherIncome, address, city, state, pincode,
          schoolName, schoolAddress, schoolCity, schoolType,
          schoolBoard, schoolMedium, stream, careerAspirations, fileUrls.join("\n"),
          payment_id, "✅ Paid", pdfUrl
        ]]
      }
    });

    sendPaymentConfirmationEmail(email, {
      name: userData.name,
      paymentId: payment_id,
      amount: "₹300",
      fileUrls: [pdfUrl, ...fileUrls]
    });

    res.json({ success: true, message: "✅ Registration Successful." });

  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// GET route to fetch application PDF link
router.get("/myApplication/:aadhaar", async (req, res) => {
  const { aadhaar } = req.params;

  try {
    const folderList = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${aadhaar}'`,
      fields: "files(id, name)",
      spaces: "drive"
    });

    if (!folderList.data.files.length) {
      return res.status(404).json({ success: false, message: "Folder not found" });
    }

    const folderId = folderList.data.files[0].id;

    const filesList = await drive.files.list({
      q: `'${folderId}' in parents and name contains 'application' and mimeType='application/pdf'`,
      fields: "files(id, name)"
    });

    if (!filesList.data.files.length) {
      return res.status(404).json({ success: false, message: "Application PDF not found" });
    }

    const file = filesList.data.files[0];
    const url = `https://drive.google.com/file/d/${file.id}/view`;

    res.json({ success: true, fileUrl: url });
  } catch (err) {
    console.error("❌ Error in /myApplication:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
