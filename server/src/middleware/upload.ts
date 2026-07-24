import multer from "multer";

export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_EXT = [
  "pdf",
  "csv",
  "xls",
  "xlsx",
  "doc",
  "docx",
  "txt",
  "jpg",
  "jpeg",
  "png",
  // media captured in-browser by MediaComposer (voice/video/photo)
  "webm",
];
export const BLOCKED_EXT = ["zip"];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_BYTES },
  fileFilter: (_req, file, cb) => {
    const ext = file.originalname.split(".").pop()?.toLowerCase() ?? "";
    if (BLOCKED_EXT.includes(ext)) return cb(new Error(".zip files are not allowed"));
    if (!ALLOWED_EXT.includes(ext)) return cb(new Error(`Unsupported file type: .${ext}`));
    cb(null, true);
  },
});
