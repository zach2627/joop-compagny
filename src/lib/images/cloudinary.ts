type CloudinaryTransformOptions = {
  width: number;
  height: number;
  crop?: "fill" | "fit" | "pad" | "limit";
  gravity?: "auto" | "auto:subject" | "center";
  background?: string;
  quality?: "auto" | "auto:good" | "auto:eco";
};

const DEFAULT_CLOUDINARY_CLOUD_NAME = "dlfytqzpw";
const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? DEFAULT_CLOUDINARY_CLOUD_NAME;

function buildTransformation({
  width,
  height,
  crop = "pad",
  gravity,
  background,
  quality = "auto:good",
}: CloudinaryTransformOptions) {
  return [
    "f_auto",
    `q_${quality}`,
    `c_${crop}`,
    gravity ? `g_${gravity}` : null,
    `w_${width}`,
    `h_${height}`,
    background ? `b_${background}` : null,
  ]
    .filter(Boolean)
    .join(",");
}

export function getCloudinaryImageUrl(
  url: string | null | undefined,
  options: CloudinaryTransformOptions
) {
  if (!url) return "";

  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "res.cloudinary.com") return url;

    const marker = "/image/upload/";
    const markerIndex = url.indexOf(marker);
    if (markerIndex === -1) return url;

    const beforeUpload = url.slice(0, markerIndex + marker.length);
    const afterUpload = url.slice(markerIndex + marker.length);
    const parts = afterUpload.split("/");
    const firstSegment = parts[0] ?? "";
    const hasExistingTransform =
      firstSegment.includes(",") || firstSegment.startsWith("c_");
    const sourcePath = hasExistingTransform ? parts.slice(1).join("/") : afterUpload;

    return `${beforeUpload}${buildTransformation(options)}/${sourcePath}`;
  } catch {
    return url;
  }
}

export function buildCloudinaryUploadUrl(sourcePath: string) {
  const normalizedPath = sourcePath.replace(/^\/+/, "");
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${normalizedPath}`;
}

export const productCardImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 900,
    height: 900,
    crop: "pad",
    background: "rgb:fffaf6",
  });

export const productDetailImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 1400,
    height: 1400,
    crop: "pad",
    background: "rgb:fffaf6",
  });

export const productThumbnailImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 240,
    height: 240,
    crop: "pad",
    background: "rgb:fffaf6",
  });

export const heroBackgroundImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 2400,
    height: 900,
    crop: "fill",
    gravity: "auto:subject",
  });

export const categoryCardImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 960,
    height: 1320,
    crop: "fill",
    gravity: "auto:subject",
  });

export const editorialFeatureImage = (url: string | null | undefined) =>
  getCloudinaryImageUrl(url, {
    width: 1200,
    height: 1500,
    crop: "fill",
    gravity: "auto:subject",
  });
