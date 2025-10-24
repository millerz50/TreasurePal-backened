import { bucket } from "./firebaseAdmin";

/**
 * Uploads a buffer to Firebase Storage and returns the public URL.
 * @param buffer - The image buffer from multer
 * @param filename - Original filename (used for naming)
 * @returns Public URL of the uploaded image
 */
export async function uploadToFirebase(buffer: Buffer, filename: string): Promise<string> {
  const timestamp = Date.now();
  const file = bucket.file(`agents/${timestamp}-${filename}`);

  await file.save(buffer, {
    contentType: "image/jpeg", // You can make this dynamic if needed
    public: true,
    metadata: {
      cacheControl: "public, max-age=31536000",
    },
  });

  await file.makePublic();
  return file.publicUrl();
}
