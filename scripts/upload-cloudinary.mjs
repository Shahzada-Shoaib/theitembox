import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { v2 as cloudinary } from "cloudinary";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const OUTPUT_DIR = path.join(PROJECT_ROOT, ".artifacts");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "cloudinary-images.json");
const CLOUDINARY_ROOT = "mustafa-zahid/tib";
const IMAGE_EXTENSIONS = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);
const isDryRun = process.argv.includes("--dry-run");

function toCloudinaryPath(value) {
  return value.split(path.sep).join("/");
}

async function findImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return findImages(entryPath);
      }

      return IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())
        ? [entryPath]
        : [];
    })
  );

  return files.flat().sort();
}

function getUploadDetails(filePath) {
  const relativePath = path.relative(PUBLIC_DIR, filePath);
  const relativeDirectory = path.dirname(relativePath);
  const filename = path.basename(relativePath, path.extname(relativePath));
  const nestedFolder = relativeDirectory === "." ? "" : toCloudinaryPath(relativeDirectory);
  const assetFolder = nestedFolder
    ? `${CLOUDINARY_ROOT}/${nestedFolder}`
    : CLOUDINARY_ROOT;

  return {
    assetFolder,
    filePath,
    localPath: `/${toCloudinaryPath(relativePath)}`,
    publicId: `${assetFolder}/${filename}`,
  };
}

function configureCloudinary() {
  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME, CLOUDINARY_URL } =
    process.env;

  if (CLOUDINARY_URL) {
    return;
  }

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error(
      "Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env."
    );
  }

  cloudinary.config({
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    cloud_name: CLOUDINARY_CLOUD_NAME,
    secure: true,
  });
}

async function uploadImage(details) {
  const result = await cloudinary.uploader.upload(details.filePath, {
    asset_folder: details.assetFolder,
    overwrite: false,
    public_id: details.publicId,
    resource_type: "image",
    tags: ["tib", "project-asset"],
    unique_filename: false,
  });

  return {
    assetFolder: details.assetFolder,
    localPath: details.localPath,
    publicId: result.public_id,
    secureUrl: result.secure_url,
  };
}

async function run() {
  const images = (await findImages(PUBLIC_DIR)).map(getUploadDetails);

  if (isDryRun) {
    console.log(`Dry run: ${images.length} images will be uploaded under ${CLOUDINARY_ROOT}.`);
    for (const image of images) {
      console.log(`${image.localPath} -> ${image.publicId}`);
    }
    return;
  }

  configureCloudinary();
  const uploaded = [];

  for (const [index, image] of images.entries()) {
    console.log(`[${index + 1}/${images.length}] Uploading ${image.localPath}`);
    uploaded.push(await uploadImage(image));
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_FILE, `${JSON.stringify(uploaded, null, 2)}\n`, "utf8");
  console.log(`Uploaded ${uploaded.length} images to ${CLOUDINARY_ROOT}.`);
  console.log(`URL manifest written to ${path.relative(PROJECT_ROOT, OUTPUT_FILE)}.`);
}

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
