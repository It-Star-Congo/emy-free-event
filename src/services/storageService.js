const fs = require("fs");
const path = require("path");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function storeFile(file, folder = "uploads") {
  const driver = process.env.STORAGE_DRIVER || "local";
  if (driver !== "local") {
    // Point d'extension prod: uploader S3/Cloudinary selon driver.
    return `/uploads/${Date.now()}-${file.originalname}`;
  }

  const uploadDir = path.join(process.cwd(), "public", folder);
  ensureDir(uploadDir);
  const safeName = `${Date.now()}-${String(file.originalname || "file").replace(/\s+/g, "-")}`;
  const absolutePath = path.join(uploadDir, safeName);
  await fs.promises.writeFile(absolutePath, file.buffer);
  return `/${folder}/${safeName}`;
}

module.exports = { storeFile };

