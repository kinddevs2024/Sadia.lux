const BLOB_STORAGE_BASE_URL = 'https://uqp6kpcfed9nx1c9.public.blob.vercel-storage.com';

export const getImageUrl = (url) => {
  if (!url) return '';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/')) {
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BLOB_STORAGE_BASE_URL}/${cleanPath}`;
  }
  
  return `${BLOB_STORAGE_BASE_URL}/uploads/${url}`;
};
