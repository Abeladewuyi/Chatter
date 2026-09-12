const WORKER_URL = import.meta.env.VITE_UPLOAD_WORKER_URL;

/**
 * Uploads a file to our Cloudflare Worker, which verifies the person is
 * really logged in (via their Firebase ID token) before writing the file
 * into R2. Returns the public URL of the uploaded file.
 */
export async function uploadImageToWorker(file, folder, idToken) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder); // e.g. "profile-pictures" or "post-images"

  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}

/**
 * Basic client-side validation before we even attempt an upload —
 * catches obviously-wrong files early instead of letting the Worker reject them.
 */
export function validateImageFile(file, maxSizeMB = 5) {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file.";
  }
  if (file.size > maxSizeMB * 1024 * 1024) {
    return `Image must be smaller than ${maxSizeMB}MB.`;
  }
  return null;
}