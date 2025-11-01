import FormData from "form-data";
import fs from "fs";
import fetch from "node-fetch";
import { saveTempFile } from "./saveTempFile";

export async function uploadToAppwriteBucket(
  buffer: Buffer,
  filename: string
): Promise<string> {
  const tempPath = await saveTempFile(buffer, filename);
  const fileStream = fs.createReadStream(tempPath);

  const form = new FormData();
  form.append("fileId", "unique()");
  form.append("file", fileStream, filename);

  const response = await fetch(
    `${process.env.APPWRITE_ENDPOINT}/storage/buckets/agents-bucket/files`,
    {
      method: "POST",
      headers: {
        "X-Appwrite-Project": process.env.APPWRITE_PROJECT_ID!,
        "X-Appwrite-Key": process.env.APPWRITE_API_KEY!,
        ...form.getHeaders(),
      },
      body: form,
    }
  );

  fs.unlinkSync(tempPath); // Clean up temp file

  const result = (await response.json()) as { $id: string; message?: string };

  if (!response.ok) throw new Error(result.message || "Upload failed");

  return `${process.env.APPWRITE_ENDPOINT}/storage/buckets/agents-bucket/files/${result.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;
}
