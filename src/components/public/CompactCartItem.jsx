const CompactCartItem = ({ item }) => {
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // For uploaded files, use backend URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const imageUrl = item.product?.images?.[0]?.url;
  const mainImage = imageUrl ? getImageUrl(imageUrl) : '';

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
      {mainImage ? (
        <img
          src={mainImage}
          alt={item.product?.name || 'Product'}
          className="w-12 h-12 object-cover rounded flex-shrink-0"
        />
      ) : (
        <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
          <span className="text-gray-400 text-xs">Нет</span>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
          {item.product?.name}
        </p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {item.size} × {item.quantity}
        </p>
        <p className="text-sm font-semibold text-primary mt-0.5">
          {Number(item.price * item.quantity).toFixed(2)} сум
        </p>
      </div>
    </div>
  );
};

export default CompactCartItem;

