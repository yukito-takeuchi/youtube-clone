import { Area } from 'react-easy-crop';

/**
 * Creates a cropped image from the source image and crop area
 * @param imageSrc - Source image URL
 * @param pixelCrop - Crop area in pixels
 * @param rotation - Rotation in degrees (optional)
 * @returns Promise<Blob> - Cropped image as Blob
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Set canvas size to accommodate rotation
  canvas.width = safeArea;
  canvas.height = safeArea;

  // Translate and rotate canvas
  ctx.translate(safeArea / 2, safeArea / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-safeArea / 2, -safeArea / 2);

  // Draw rotated image
  ctx.drawImage(
    image,
    safeArea / 2 - image.width * 0.5,
    safeArea / 2 - image.height * 0.5
  );

  // Get the cropped data
  const data = ctx.getImageData(0, 0, safeArea, safeArea);

  // Set canvas to final crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Paste the cropped area
  ctx.putImageData(
    data,
    Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
    Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
  );

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}

/**
 * Creates an Image element from a URL
 * @param url - Image URL
 * @returns Promise<HTMLImageElement>
 */
function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });
}

/**
 * Reads a File and returns a data URL
 * @param file - File to read
 * @returns Promise<string> - Data URL
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result as string));
    reader.readAsDataURL(file);
  });
}
