import { v2 as cloudinary } from "cloudinary";
import { Readable } from "node:stream";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const runtime = "nodejs";

function configureCloudinary() {
  if (process.env.CLOUDINARY_URL) return true;
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) return false;
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
  return true;
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }
  if (!configureCloudinary()) {
    return Response.json(
      { error: "Add the server-only Cloudinary credentials to .env before uploading." },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "Choose an image to upload." }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return Response.json({ error: "Only image files are supported." }, { status: 400 });
  }
  if (file.size > 12 * 1024 * 1024) {
    return Response.json({ error: "Image must be smaller than 12 MB." }, { status: 413 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        asset_folder: "mustafa-zahid/tib/products",
        resource_type: "image",
        tags: ["tib", "admin-upload"],
        use_filename: true,
        unique_filename: true,
      },
      (error, uploadResult) => {
        if (error || !uploadResult) reject(error ?? new Error("Cloudinary returned no result."));
        else resolve(uploadResult);
      }
    );
    Readable.from(buffer).pipe(upload);
  });

  return Response.json({ url: result.secure_url });
}
