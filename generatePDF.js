const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const axios = require("axios");

async function toBase64FromUrl(url) {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  const mimeType = response.headers["content-type"];
  const base64 = Buffer.from(response.data, "binary").toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

async function generatePDF(data, photoUrl) {
  const outputPath = path.join(__dirname, `temp/${data.aadhaar}_application.pdf`);

  const qrData = JSON.stringify({
    name: data.name,
    aadhaar: data.aadhaar,
    email: data.email,
    mobile: data.mobile,
  });
  const qrBase64 = await QRCode.toDataURL(qrData);

  // ✅ Convert photoUrl to base64
  const photoBase64 = photoUrl.startsWith("http")
    ? await toBase64FromUrl(photoUrl)
    : photoUrl;

  // ✅ Watermark logo (ensure correct path and extension)
  const logoPath = path.join(__dirname, "./public/assets/kalyanLogo.jpg");
  console.log("Logo exists:", fs.existsSync(logoPath), logoPath);
  const logoBase64 = fs.existsSync(logoPath)
    ? fs.readFileSync(logoPath).toString("base64")
    : "";

  const html = `
  <html>
    <head>
      <style>
        body {
          font-family: 'Segoe UI', sans-serif;
          padding: 30px;
          color: #222;
          position: relative;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        h1 {
          font-size: 28px;
          margin: 0;
        }
        h2 {
          font-size: 18px;
          margin: 5px 0;
          color: #777;
        }
        .section {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 15px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .section h3 {
          margin-bottom: 12px;
          font-size: 20px;
          color: #004b8d;
          border-bottom: 1px solid #eee;
          padding-bottom: 5px;
        }
        .field {
          margin: 4px 0;
        }
        .field span {
          font-weight: bold;
        }
        .flex-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }
        .photo, .qr {
          width: 110px;
          height: 130px;
          border: 1px solid #ccc;
          background-size: cover;
          background-position: center;
          border-radius: 6px;
        }
        .qr {
          height: 110px;
          margin-top: 10px;
        }
        .meta {
          font-size: 14px;
          margin-top: 20px;
          text-align: center;
          color: #444;
        }
        .watermark {
          position: fixed;
          top: 30%;
          left: 20%;
          width: 400px;
          opacity: 0.08;
          z-index: -1;
        }
      </style>
    </head>
    <body>
      ${logoBase64
      ? `<img class="watermark" src="data:image/jpeg;base64,${logoBase64}" />`
      : ""
    }

      <div class="header">
        <h1>Genius Challenge Gujarat (GCG) Exam</h1>
        <h2>Scholarship Registration Application</h2>
      </div>

      <div class="section">
        <h3>Personal Details</h3>
        <div class="flex-row">
          <div style="flex:1">
            ${field("Full Name", data.name)}
            ${field("Email", data.email)}
            ${field("Mobile", data.mobile)}
            ${field("WhatsApp", data.whatsapp)}
            ${field("Aadhaar Number", data.aadhaar)}
            ${field("Father's Income", data.fatherIncome)}
            ${field("Address", data.address)}
          </div>
          <div>
            <div class="photo" style="background-image: url('${photoBase64}')"></div>
            <img class="qr" src="${qrBase64}" />
          </div>
        </div>
      </div>

      <div class="section">
        <h3>Academic Details</h3>
        ${field("School Name", data.schoolName)}
        ${field("School Address", data.schoolAddress)}
        ${field("School City", data.schoolCity)}
        ${field("School Type", data.schoolType)}
        ${field("Board", data.schoolBoard)}
        ${field("Medium", data.schoolMedium)}
        ${field("Last Standard Percentage", data.lastMarks)}
        ${field("Desired Stream After 10th", data.stream)}
        ${field("Career Aspirations", data.careerAspirations)}
      </div>

      <div class="section">
        <h3>Submission Info</h3>
        ${field("Application ID", data.aadhaar + "GCG" + Math.random().toString(36).substring(2, 5))}
        ${field("Payment Status", "Paid")}
        ${field("Submission Date", new Date().toLocaleDateString())}
      </div>

      <div class="meta">
        I hereby declare that all the information provided above is true to the best of my knowledge and belief.
      </div>
    </body>
  </html>
  `;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.pdf({ path: outputPath, format: "A4", printBackground: true });
  await browser.close();

  return outputPath;
}

function field(label, value) {
  return `<div class="field"><span>${label}:</span> ${value || "N/A"}</div>`;
}


module.exports = generatePDF;