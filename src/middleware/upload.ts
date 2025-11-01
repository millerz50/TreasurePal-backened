import multer from "multer";

const storage = multer.memoryStorage(); // Store file in memory
export const upload = multer({ storage });
