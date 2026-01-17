/**
 * Utility function to get image URL
 * Converts relative paths to blob storage URLs
 * Base blob storage URL: https://gpkikexo3fkwpz9o.public.blob.vercel-storage.com
 */
const BLOB_STORAGE_BASE_URL = 'https://gpkikexo3fkwpz9o.public.blob.vercel-storage.com';

export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already a full URL (blob storage or external), return as-is
  // This handles blob storage URLs like: 
  // https://gpkikexo3fkwpz9o.public.blob.vercel-storage.com/uploads/IMG_1654.PNG
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If we get a relative path like /uploads/IMG_1654.PNG,
  // convert it to full blob storage URL
  if (url.startsWith('/')) {
    // Remove leading slash and prepend blob storage base URL
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BLOB_STORAGE_BASE_URL}/${cleanPath}`;
  }
  
  // If path doesn't start with /, prepend blob storage base URL with /uploads/
  return `${BLOB_STORAGE_BASE_URL}/uploads/${url}`;
};
