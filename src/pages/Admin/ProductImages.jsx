import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { Analytics } from '@vercel/analytics/react';
import api from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ProductImages = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imageUrl, setImageUrl] = useState('');
  const [uploadMethod, setUploadMethod] = useState('file');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const { data: productData } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.getProduct(id),
  });

  const product = productData?.data;
  const images = product?.images || [];

  const addImageMutation = useMutation({
    mutationFn: async (data) => {
      if (typeof data === 'string') {
        const response = await api.post(`/products/${id}/images`, { url: data });
        return response.data;
      } else {
        const formData = new FormData();
        formData.append('file', data);
        const response = await api.post(`/products/${id}/images`, formData);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      queryClient.invalidateQueries(['admin-products']);
      setImageUrl('');
      setSelectedFile(null);
      setPreviewUrl('');
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId) => {
      const response = await api.delete(`/products/images/${imageId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      queryClient.invalidateQueries(['admin-products']);
    },
  });

  const updateImageOrderMutation = useMutation({
    mutationFn: async (reorderedImages) => {
      console.log('Updating image order:', reorderedImages.length, 'images');
      const response = await api.put(`/products/${id}`, {
        images: reorderedImages,
      });
      console.log('Image order update response:', response.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['product', id]);
      queryClient.invalidateQueries(['admin-products']);
    },
    onError: (error) => {
      console.error('Error updating image order:', error);
      alert('Ошибка при обновлении порядка изображений: ' + (error.response?.data?.error || error.message));
    },
  });

  const handleMoveUp = (imageId) => {
    const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
    const imageIndex = sortedImages.findIndex(img => img.id === imageId);
    
    if (imageIndex <= 0) return;
    
    const newImages = [...sortedImages];
    const currentOrder = newImages[imageIndex].order || imageIndex;
    const prevOrder = newImages[imageIndex - 1].order || (imageIndex - 1);
    
    newImages[imageIndex].order = prevOrder;
    newImages[imageIndex - 1].order = currentOrder;
    
    
    newImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    updateImageOrderMutation.mutate(newImages);
  };

  const handleMoveDown = (imageId) => {
    const sortedImages = [...images].sort((a, b) => (a.order || 0) - (b.order || 0));
    const imageIndex = sortedImages.findIndex(img => img.id === imageId);
    
    if (imageIndex < 0 || imageIndex >= sortedImages.length - 1) return;
    
    
    const newImages = [...sortedImages];
    const currentOrder = newImages[imageIndex].order || imageIndex;
    const nextOrder = newImages[imageIndex + 1].order || (imageIndex + 1);
    
    newImages[imageIndex].order = nextOrder;
    newImages[imageIndex + 1].order = currentOrder;
    
    
    newImages.forEach((img, idx) => {
      img.order = idx;
    });
    
    updateImageOrderMutation.mutate(newImages);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
      const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];
      
      if (!allowedTypes.includes(file.type)) {
        alert('Неверный тип файла. Разрешены только изображения (JPEG, PNG, WebP, GIF) и видео (MP4, WebM, OGG)');
        return;
      }
      
      const isVideo = allowedVideoTypes.includes(file.type);
      
      
      const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert(`Размер файла превышает ${isVideo ? '50MB' : '5MB'}`);
        return;
      }

      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = (e) => {
    e.preventDefault();
    if (uploadMethod === 'url' && imageUrl.trim()) {
      
      const urlToAdd = getImageUrl(imageUrl.trim());
      addImageMutation.mutate(urlToAdd);
    } else if (uploadMethod === 'file' && selectedFile) {
      addImageMutation.mutate(selectedFile);
    } else {
      alert(uploadMethod === 'url' ? 'Введите URL изображения' : 'Выберите файл');
    }
  };

  const handleDeleteImage = (imageId) => {
    if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  if (!product) {
    return (
      <div className="p-8">
        <div className="text-center py-8">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <button
            onClick={() => navigate('/admin/products')}
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-2"
          >
            ← Назад к продуктам
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Изображения: {product.name}
          </h1>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Добавить изображение или видео
        </h2>
        
        <div className="flex gap-4 mb-4">
          <button
            type="button"
            onClick={() => {
              setUploadMethod('file');
              setImageUrl('');
              setSelectedFile(null);
              setPreviewUrl('');
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              uploadMethod === 'file'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            С устройства
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadMethod('url');
              setSelectedFile(null);
              setPreviewUrl('');
            }}
            className={`px-4 py-2 rounded-md transition-colors ${
              uploadMethod === 'url'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            По URL
          </button>
        </div>

        <form onSubmit={handleAddImage} className="space-y-4">
          {uploadMethod === 'file' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Выберите файл (Изображения: JPEG, PNG, WebP, GIF до 5MB | Видео: MP4, WebM, OGG до 50MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-200
                    hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                    cursor-pointer"
                />
              </div>
              {previewUrl && selectedFile && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Предпросмотр:</p>
                  {selectedFile.type.startsWith('video/') ? (
                    <video
                      src={previewUrl}
                      controls
                      className="max-w-xs max-h-48 rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  ) : (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-w-xs max-h-48 rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="URL изображения или видео (https://... или /uploads/...)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {imageUrl && imageUrl.trim() && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Предпросмотр:</p>
                  {(() => {
                    const previewUrl = getImageUrl(imageUrl.trim());
                    const isVideo = previewUrl && /\.(mp4|webm|ogg|mov|m4v)$/i.test(previewUrl);
                    return isVideo ? (
                      <video
                        src={previewUrl}
                        controls
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300 dark:border-gray-600"
                        onError={(e) => {
                          console.error('Error loading video preview:', previewUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-w-xs max-h-48 rounded-lg border border-gray-300 dark:border-gray-600 object-contain"
                        onError={(e) => {
                          console.error('Error loading image preview:', previewUrl);
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  })()}
                </div>
              )}
            </div>
          )}
          <button
            type="submit"
            disabled={addImageMutation.isPending || (uploadMethod === 'file' && !selectedFile) || (uploadMethod === 'url' && !imageUrl.trim())}
            className="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addImageMutation.isPending ? 'Добавление...' : 'Добавить медиа файл'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Медиа файлы продукта ({images.length})
        </h2>
        {images.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Нет медиа файлов. Добавьте первое изображение или видео выше.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(() => {
              const sortedImages = images
                .filter((image) => image && image.url)
                .sort((a, b) => (a.order || 0) - (b.order || 0));
              
              return sortedImages.map((image, index) => {
                const mediaUrl = getImageUrl(image.url);
                const isVideo = image.type === 'video' || 
                  (image.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(image.url));

                return (
                  <div
                    key={image.id}
                    className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700">
                      {isVideo ? (
                        <video
                          src={mediaUrl}
                          className="w-full h-full object-cover"
                          controls={false}
                          muted
                          onMouseEnter={(e) => e.target.play()}
                          onMouseLeave={(e) => {
                            e.target.pause();
                            e.target.currentTime = 0;
                          }}
                        />
                      ) : (
                        <img
                          src={mediaUrl}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    {isVideo && (
                      <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        Видео
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      #{index + 1}
                    </div>
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <button
                        onClick={() => handleMoveUp(image.id)}
                        disabled={updateImageOrderMutation.isPending || index === 0}
                        className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Переместить вверх"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMoveDown(image.id)}
                        disabled={updateImageOrderMutation.isPending || index === sortedImages.length - 1}
                        className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Переместить вниз"
                      >
                        ↓
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        disabled={deleteImageMutation.isPending}
                        title="Удалить"
                      >
                        ×
                      </button>
                    </div>
                    <div className="p-2 bg-white dark:bg-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isVideo ? 'Видео' : 'Изображение'}
                      </p>
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        )}
      </div>
      <Analytics />
    </div>
  );
};

export default ProductImages;
