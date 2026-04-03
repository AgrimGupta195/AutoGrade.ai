import dotenv from "dotenv";
import { uploadToS3Universal } from "./UploadService";

dotenv.config();

async function run() {
  const testUrl = "https://www.rd.usda.gov/sites/default/files/pdf-sample_0.pdf";
  const uploadedUrl = await uploadToS3Universal(testUrl);
  console.log("Uploaded URL:", uploadedUrl);
}

run().catch((error) => {
  console.error("Upload test failed:", error instanceof Error ? error.message : error);
  process.exit(1);
});
