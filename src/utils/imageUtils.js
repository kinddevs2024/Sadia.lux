/**
 * Utility function to get image URL
 * Returns blob storage URLs as-is - never converts to localhost
 * The backend should send blob storage URLs (https://...)
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already a full URL (blob storage or external), return as-is
  // This handles blob storage URLs like: https://[id].public.blob.vercel-storage.com/...
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If we get a relative path like /uploads/..., it means:
  // 1. The backend should have sent a blob storage URL but didn't
  // 2. OR we're in development and the file is served locally
  
  // For now, return relative paths as-is - let the browser handle them
  // The backend should ensure all URLs are blob storage URLs (full https:// URLs)
  // If relative paths are received, the backend needs to fix this
  
  // NOTE: We don't convert to localhost anymore - backend should send blob URLs
  // If you're seeing relative paths, check that BLOB_READ_WRITE_TOKEN is set
  // and re-import products to get blob storage URLs
  
  return url;
};
