export type ImageCompressionOptions = {
  maxWidth?: number;
  quality?: number;
  mimeType?: "image/jpeg" | "image/webp";
};

export async function fileToCompressedDataUrl(
  file: File,
  options: ImageCompressionOptions = {},
): Promise<string> {
  const { maxWidth = 1200, mimeType = "image/jpeg", quality = 0.82 } = options;
  const image = await loadImage(file);
  const scale = Math.min(1, maxWidth / image.naturalWidth);
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    return await readFileAsDataUrl(file);
  }

  canvas.width = width;
  canvas.height = height;

  // JPEG does not support transparency, so fill first to avoid black backgrounds
  // when users import transparent PNG screenshots or edited images.
  context.fillStyle = "#fffdfa";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  return canvas.toDataURL(mimeType, quality);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    image.src = url;
  });
}
