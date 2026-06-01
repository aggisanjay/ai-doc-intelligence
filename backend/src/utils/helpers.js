'use strict';
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

function generateUniqueFilename(originalFilename) {
  const ext = path.extname(originalFilename).toLowerCase();
  return `${uuidv4()}${ext}`;
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
  return dirPath;
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function httpError(message, status = 400) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function moveFile(src, dest) {
  try {
    await fs.promises.rename(src, dest);
  } catch (err) {
    if (err.code === 'EXDEV') {
      await fs.promises.copyFile(src, dest);
      await fs.promises.unlink(src);
    } else {
      throw err;
    }
  }
}

module.exports = { generateUniqueFilename, ensureDir, formatFileSize, httpError, moveFile };
