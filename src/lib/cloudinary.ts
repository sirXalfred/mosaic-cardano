export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing. Please contact support.");
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image. Please try again.");
  }

  const data = await response.json();
  return data.secure_url;
}

export async function uploadTextToCloudinary(text: string, documentId: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration is missing. Please contact support.");
  }

  const formData = new FormData();
  const blob = new Blob([text], { type: 'text/html' });
  formData.append('file', blob, `${documentId}.html`);
  formData.append('upload_preset', uploadPreset);
  // Optionally specify public_id so it overwrites instead of creating a new file every time
  formData.append('public_id', documentId);

  // Use raw/upload since it's a non-image file
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload document content to Cloudinary.");
  }

  const data = await response.json();
  return data.secure_url;
}

