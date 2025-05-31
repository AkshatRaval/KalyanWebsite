const fs = require("fs");
const { google } = require("googleapis");
const path = require("path");

const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, "keyGoogle.json"),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

async function uploadFileToDrive(filePath, fileName, folderId) {
  const drive = google.drive({ version: "v3", auth: await auth.getClient() });

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const media = {
    mimeType: "application/pdf",
    body: fs.createReadStream(filePath),
  };

  const file = await drive.files.create({
    resource: fileMetadata,
    media,
    fields: "id",
  });

  await drive.permissions.create({
    fileId: file.data.id,
    requestBody: {
      role: "reader",
      type: "anyone",
    },
  });

  return `https://drive.google.com/file/d/${file.data.id}/view`;
}

module.exports = uploadFileToDrive;
