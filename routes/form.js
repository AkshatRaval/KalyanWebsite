const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const router = express.Router(); // ✅ Make sure this line is here
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");
const { Readable } = require("stream");
const Razorpay = require("razorpay");

const upload = multer({ storage: multer.memoryStorage() });

const generatePDF = require("../generatePDF");
const uploadFileToDrive = require("../uploadFileToDrive"); // ✅ These should exist

router.post("/submit", upload.any(), async (req, res) => {
  try {
    const {
      firstName, middleName, lastName, email, mobile,
      whatsapp, aadhaar, fatherIncome, address, city, state,
      pincode, schoolName, schoolAddress, schoolCity,
      schoolType, schoolBoard, schoolMedium, rollNumber,
      ninthMarks, bestSubject, weakestSubject, stream,
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

    // Upload user files
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

    // Generate + upload application PDF
    const userData = {
      aadhaar,
      name: `${firstName} ${middleName} ${lastName}`,
      email, mobile, whatsapp,
      fatherIncome, address, city, state, pincode,
      schoolName, schoolAddress, schoolCity,
      schoolType, schoolBoard, schoolMedium,
      rollNumber, ninthMarks, bestSubject,
      weakestSubject, stream, careerAspirations
    };

    const pdfPath = await generatePDF(userData);
    const pdfUrl = await uploadFileToDrive(pdfPath, `${aadhaar}_application.pdf`, folderId);

    // Remove local PDF
    fs.unlinkSync(pdfPath);

    // Append to sheet
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
          schoolBoard, schoolMedium, rollNumber,
          ninthMarks, bestSubject, weakestSubject,
          stream, careerAspirations, fileUrls.join("\n"),
          payment_id, "✅ Paid", pdfUrl
        ]]
      }
    });

    // Send email
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

module.exports = router;