import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase/config";

/**
 * Uploads a file to Firebase Storage at the given path, then returns the
 * public download URL for it. Kept generic (not "uploadProfilePicture"
 * specifically) so it can be reused later for post images and message images.
 */
export async function uploadImage(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return url;
}

/**
 * Basic client-side validation before we even attempt an upload.
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