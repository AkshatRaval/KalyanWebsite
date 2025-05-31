const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generatePDF(data) {
  return new Promise((resolve, reject) => {
    const pdfPath = path.join(__dirname, `temp/${data.aadhaar}_application.pdf`);
    const doc = new PDFDocument();
    const stream = fs.createWriteStream(pdfPath);

    doc.pipe(stream);
    doc.fontSize(18).text("Scholarship Application Form", { align: "center" });
    doc.moveDown();

    for (const [key, value] of Object.entries(data)) {
      doc.fontSize(12).text(`${key.toUpperCase()}: ${value}`);
    }

    doc.end();

    stream.on("finish", () => resolve(pdfPath));
    stream.on("error", reject);
  });
}

module.exports = generatePDF;
