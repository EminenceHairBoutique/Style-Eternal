// src/utils/imageProcessing.js
// Shared image-processing helpers used by custom-order pages.

export const MAX_REFERENCE_IMAGES = 4;
export const MAX_ORIGINAL_MB = 12;
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;

/**
 * Sanitizes a filename for safe storage.
 * Strips the extension, replaces special characters with hyphens, and appends ".jpg".
 */
export const safeFilename = (name = "reference") => {
  const base = String(name || "reference")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 40);
  return `${base || "reference"}.jpg`;
};

/**
 * Reads a Blob/File as a base64-encoded string (without the data-URL prefix).
 */
export const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || "");
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(blob);
  });

/**
 * Decodes an image File into a drawable source (ImageBitmap when available, <img> element otherwise).
 */
export const fileToImage = async (file) => {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return bitmap;
  }

  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Unable to read image"));
    reader.readAsDataURL(file);
  });

  const img = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Unable to load image"));
    el.src = dataUrl;
  });
  return img;
};

/**
 * Compresses an image File and returns a result object containing the Blob and metadata.
 * Each caller can decide whether to use the blob directly or convert it to base64.
 *
 * Returns: { id, filename, label, blob, contentType, bytes, previewUrl }
 */
export const compressImageToBlob = async (file) => {
  const bitmap = await fileToImage(file);
  const width = bitmap.width || bitmap.naturalWidth || 1;
  const height = bitmap.height || bitmap.naturalHeight || 1;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));
  const targetW = Math.max(1, Math.round(width * scale));
  const targetH = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to process image");
  // White background so transparent PNGs don't render black in JPEG
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);
  ctx.drawImage(bitmap, 0, 0, targetW, targetH);
  if (typeof bitmap.close === "function") bitmap.close();

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Unable to compress image"))),
      "image/jpeg",
      JPEG_QUALITY
    );
  });

  const previewUrl = URL.createObjectURL(blob);
  const id =
    (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
    `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id,
    filename: safeFilename(file?.name),
    label: "Inspiration",
    blob,
    contentType: blob.type,
    bytes: blob.size,
    previewUrl,
  };
};

/**
 * Compresses an image File, converts it to base64, and returns a result object.
 * Use this variant when the image needs to be sent as JSON (e.g. email/API payloads).
 *
 * Returns: { id, filename, label, content (base64 string), contentType, bytes, previewUrl }
 */
export const compressImageToBase64 = async (file) => {
  const result = await compressImageToBlob(file);
  const content = await blobToBase64(result.blob);
  return {
    id: result.id,
    filename: result.filename,
    label: result.label,
    content,
    contentType: result.contentType,
    bytes: result.bytes,
    previewUrl: result.previewUrl,
  };
};
