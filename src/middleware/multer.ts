import moment from "moment";
import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import path from "path";

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (!file.mimetype.includes("image/svg")) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Invalid file type. SVG files are not allowed")); // Reject the file
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../assets/uploads/")); // Ensure directory path is correct
  },
  filename: (req, file, cb) => {
    const uploadDateTime = moment(new Date()).format("YYYYMMDDHHmmss");
    cb(null, `${uploadDateTime}_${file.originalname.replace(/\s/g, "_")}`);
  },
});

// Multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 7340032, // Limit file size to ~7MB
  },
});

// Middleware to check file upload
export const checkFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  } else {
    next();
  }
};

export default upload;
