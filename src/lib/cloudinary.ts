import crypto from "crypto";

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

type CloudinaryConfig = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
};

type CloudinaryUploadResponse = {
  secure_url?: string;
  public_id?: string;
  error?: {
    message?: string;
  };
};

export type UploadedImage = {
  imageUrl: string;
  publicId?: string;
};

function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_PROFILE_FOLDER || "lead-pilot/profiles";

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not configured");
  }

  return { cloudName, apiKey, apiSecret, folder };
}

function createSignature(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}

export async function uploadImageToCloudinary(image: File): Promise<UploadedImage> {
  if (!image.type.startsWith("image/")) {
    throw new Error("Only image files are allowed");
  }

  if (image.size > MAX_IMAGE_SIZE) {
    throw new Error("Image must be under 2 MB");
  }

  const config = getCloudinaryConfig();
  const timestamp = Math.round(Date.now() / 1000).toString();
  const uploadParams = {
    folder: config.folder,
    timestamp,
  };
  const signature = createSignature(uploadParams, config.apiSecret);
  const formData = new FormData();

  formData.append("file", image);
  formData.append("api_key", config.apiKey);
  formData.append("folder", uploadParams.folder);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return {
    imageUrl: data.secure_url,
    publicId: data.public_id,
  };
}
