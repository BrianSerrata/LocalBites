// utils/uploadImageAsync.js
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase'; // Adjust the path if necessary

/**
 * Uploads an image to Firebase Storage and returns its download URL.
 *
 * @param {string} uri - The local URI of the image to upload.
 * @param {string} path - The storage path where the image will be uploaded.
 * @returns {Promise<string>} - The download URL of the uploaded image.
 * @throws {Error} - Throws an error if the upload fails.
 */
export const uploadImageAsync = async (uri, path) => {
  try {
    // Convert image URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Create a reference to the desired path in storage
    const storageRef = ref(storage, path);

    // Upload the blob
    await uploadBytes(storageRef, blob);

    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
