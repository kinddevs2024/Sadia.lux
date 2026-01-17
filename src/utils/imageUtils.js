/**
 * Utility function to get image URL
 * Returns blob storage URLs as-is - ensures images come from blob storage
 * Handles URLs like: https://[id].public.blob.vercel-storage.com/uploads/...
 */
export const getImageUrl = (url) => {
  if (!url) return '';
  
  // If already a full URL (blob storage or external), return as-is
  // This handles blob storage URLs like: 
  // https://gpkikexo3fkwpz9o.public.blob.vercel-storage.com/uploads/IMG_1654.PNG
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If we get a relative path like /uploads/..., the backend should have sent
  // a full blob storage URL. This is a fallback for development only.
  // In production, all URLs should be full blob storage URLs.
  
  // Log warning in development if we get relative paths
  if (import.meta.env.DEV) {
    console.warn('⚠️ Received relative image URL:', url);
    console.warn('   Backend should send full blob storage URLs (https://...)');
    console.warn('   Check that BLOB_READ_WRITE_TOKEN is set and products are imported correctly');
  }
  
  // Return relative path as-is - but this shouldn't happen in production
  // The backend should always send full blob storage URLs
  return url;
};
