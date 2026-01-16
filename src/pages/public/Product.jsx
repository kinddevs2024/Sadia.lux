import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import { useCart } from '../../context/CartContext';
import SizeSelector from '../../components/public/SizeSelector';
import ProductCard from '../../components/public/ProductCard';
import Toast from '../../components/shared/Toast';
import { Analytics } from '@vercel/analytics/react';

const Product = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [imageTransition, setImageTransition] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const { data: productData, isLoading, error: productError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
    retry: 2,
  });

  const product = productData?.data;

  // Log error for debugging
  if (productError) {
    console.error('Error loading product:', productError);
  }
  const images = product?.images || [];
  const imagesLength = images.length;

  // Get related products from the same category
  const { data: relatedProductsData } = useQuery({
    queryKey: ['products', 'category', product?.categoryId, 'exclude', product?.id],
    queryFn: () => productService.getProducts({ 
      categoryId: product?.categoryId,
      limit: 8 
    }),
    enabled: !!product?.categoryId,
  });

  // Filter out current product from related products
  const relatedProducts = relatedProductsData?.data?.data?.filter(
    (p) => p.id !== product?.id
  ) || [];

  // Keyboard navigation for image modal - MUST be called before any early returns
  useEffect(() => {
    if (!showImageModal || imagesLength === 0) return;

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        setModalImageIndex((prev) => (prev + 1) % imagesLength);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setModalImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
      } else if (e.key === 'Escape') {
        setShowImageModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal, imagesLength]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (productError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Ошибка загрузки товара</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {productError.message || 'Произошла ошибка при загрузке товара'}
          </p>
          <button
            onClick={() => navigate('/shop')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Вернуться в магазин
          </button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Товар не найден</h2>
          <button
            onClick={() => navigate('/shop')}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Вернуться в магазин
          </button>
        </div>
      </div>
    );
  }

  // Safely extract inventory
  const inventory = Array.isArray(product?.inventory) ? product.inventory : [];
  const sizes = inventory.map((inv) => inv?.size).filter(Boolean);
  
  // Debug logging
  console.log('Product data:', {
    id: product?.id,
    name: product?.name,
    inventoryLength: inventory.length,
    sizesCount: sizes.length,
    hasInventory: !!product?.inventory,
  });
  
  const getImageUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    // For uploaded files, use backend URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const baseUrl = apiUrl.replace('/api', '');
    return url.startsWith('/') ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };
  
  const currentMedia = images.length > 0 && images[selectedImageIndex] 
    ? images[selectedImageIndex]
    : null;
  const mainMediaUrl = currentMedia ? getImageUrl(currentMedia.url) : '';
  const isVideo = currentMedia?.type === 'video' || 
    (currentMedia?.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(currentMedia.url));

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Пожалуйста, выберите размер');
      return;
    }

    // Check inventory availability
    const inventoryItem = inventory.find((inv) => inv.size === selectedSize);
    
    if (inventoryItem) {
      if (inventoryItem.quantity < quantity) {
        alert(`В наличии только ${inventoryItem.quantity} шт. размера ${selectedSize}. Пожалуйста, выберите меньшее количество.`);
        setQuantity(inventoryItem.quantity); // Set to max available
        return;
      }
    } else {
      alert(`Товар размера ${selectedSize} отсутствует на складе.`);
      return;
    }

    addToCart(product, selectedSize, quantity);
    setShowToast(true);
  };

  const handleImageChange = (index) => {
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImageIndex(index);
      setImageTransition(false);
    }, 150);
  };

  const openImageModal = (index) => {
    setModalImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    if (imagesLength === 0) return;
    setModalImageIndex((prev) => (prev + 1) % imagesLength);
  };

  const prevImage = () => {
    if (imagesLength === 0) return;
    setModalImageIndex((prev) => (prev - 1 + imagesLength) % imagesLength);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      {showToast && (
        <Toast
          message="Товар добавлен в корзину!"
          linkText="Перейти в корзину"
          linkTo="/cart"
          onClose={() => setShowToast(false)}
          duration={5000}
        />
      )}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Images/Video */}
          <div>
            <div 
              className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 relative cursor-pointer group"
              onClick={() => openImageModal(selectedImageIndex)}
            >
              {mainMediaUrl ? (
                isVideo ? (
                  <video
                    key={`video-${selectedImageIndex}`}
                    src={mainMediaUrl}
                    controls
                    className={`w-full h-full object-cover transition-opacity duration-300 ${
                      imageTransition ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                ) : (
                  <>
                    <img
                      key={`image-${selectedImageIndex}`}
                      src={mainMediaUrl}
                      alt={product.name}
                      className={`w-full h-full object-cover transition-opacity duration-300 ${
                        imageTransition ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center">
                      <svg 
                        className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                    </div>
                  </>
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Нет медиа файла</span>
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => {
                  const thumbUrl = getImageUrl(image.url);
                  const thumbIsVideo = image.type === 'video' || 
                    (image.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(image.url));
                  
                  return (
                    <button
                      key={image.id || index}
                      onClick={() => handleImageChange(index)}
                      className={`w-20 h-20 rounded overflow-hidden border-2 relative flex-shrink-0 transition-all duration-200 ${
                        selectedImageIndex === index
                          ? 'border-primary ring-2 ring-primary ring-opacity-50'
                          : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {thumbUrl ? (
                        thumbIsVideo ? (
                          <video
                            src={thumbUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={thumbUrl}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs">Нет</span>
                        </div>
                      )}
                      {thumbIsVideo && (
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-white text-xs px-1 rounded">
                          ▶
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.name}
            </h1>
            {product.category?.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg">
                {product.category.description}
              </p>
            )}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {product.description}
              </p>
            )}
            <div className="mb-6">
              <span className="text-4xl font-bold text-primary dark:text-primary">
                {product.price.toFixed(2)} сум
              </span>
            </div>

            {sizes.length > 0 ? (
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSizeChange={(newSize) => {
                  setSelectedSize(newSize);
                  // Reset quantity to 1 when size changes
                  setQuantity(1);
                  // If new size has limited stock, adjust quantity
                  const inventoryItem = inventory.find((inv) => inv.size === newSize);
                  if (inventoryItem && inventoryItem.quantity < quantity) {
                    setQuantity(Math.min(1, inventoryItem.quantity));
                  }
                }}
                inventory={inventory}
              />
            ) : (
              <div className="mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Размеры недоступны. Пожалуйста, добавьте размеры в инвентарь.
                </p>
              </div>
            )}

            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => {
                    // Get max available quantity for selected size
                    const inventoryItem = inventory.find((inv) => inv.size === selectedSize);
                    const maxQuantity = inventoryItem ? inventoryItem.quantity : 999;
                    setQuantity((q) => Math.min(maxQuantity, q + 1));
                  }}
                  className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={(() => {
                    const inventoryItem = inventory.find((inv) => inv.size === selectedSize);
                    const maxQuantity = inventoryItem ? inventoryItem.quantity : 0;
                    return quantity >= maxQuantity;
                  })()}
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              >
                Добавить в корзину
              </button>
            </div>

            {product.category && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Категория: <span className="font-medium text-gray-900 dark:text-white">{product.category.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Похожие товары
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedProducts.slice(0, 4).map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Modal for Full Screen View */}
      {showImageModal && images.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-7xl w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2 transition-all"
              aria-label="Закрыть"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70"
                aria-label="Предыдущее изображение"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-3 transition-all hover:bg-opacity-70"
                aria-label="Следующее изображение"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Main Image/Video */}
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const modalMedia = images[modalImageIndex];
                const modalMediaUrl = modalMedia ? getImageUrl(modalMedia.url) : '';
                const modalIsVideo = modalMedia?.type === 'video' || 
                  (modalMedia?.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(modalMedia.url));

                return modalMediaUrl ? (
                  modalIsVideo ? (
                    <video
                      src={modalMediaUrl}
                      controls
                      autoPlay
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <img
                      src={modalMediaUrl}
                      alt={`${product.name} ${modalImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )
                ) : null;
              })()}
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 rounded-full px-4 py-2 text-sm">
                {modalImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full px-4">
                {images.map((image, index) => {
                  const thumbUrl = getImageUrl(image.url);
                  const thumbIsVideo = image.type === 'video' || 
                    (image.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(image.url));
                  
                  return (
                    <button
                      key={image.id || index}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalImageIndex(index);
                      }}
                      className={`w-16 h-16 rounded overflow-hidden border-2 flex-shrink-0 transition-all ${
                        modalImageIndex === index
                          ? 'border-white ring-2 ring-white ring-opacity-50'
                          : 'border-transparent hover:border-gray-400 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {thumbUrl ? (
                        thumbIsVideo ? (
                          <video
                            src={thumbUrl}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                          />
                        ) : (
                          <img
                            src={thumbUrl}
                            alt={`${product.name} ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <Analytics />
    </div>
  );
};

export default Product;

