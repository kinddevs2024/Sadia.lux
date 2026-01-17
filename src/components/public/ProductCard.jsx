import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { getImageUrl } from "../../utils/imageUtils";

const ProductCard = ({ product, index = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Find first image (skip videos)
  const getFirstImage = () => {
    if (!product.images || product.images.length === 0) return null;
    
    const firstItem = product.images[0];
    const isFirstVideo = firstItem?.type === 'video' || 
      (firstItem?.url && /\.(mp4|webm|ogg|mov|m4v)$/i.test(firstItem.url));
    
    // If first item is video, try to get second image
    if (isFirstVideo && product.images.length > 1) {
      const secondItem = product.images[1];
      const isSecondImage = secondItem?.type !== 'video' && 
        secondItem?.url && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(secondItem.url);
      
      if (isSecondImage && secondItem?.url) {
        return getImageUrl(secondItem.url);
      }
      
      // If second is also video, find first image in array
      for (let i = 1; i < product.images.length; i++) {
        const item = product.images[i];
        if (item?.url && item?.type !== 'video' && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(item.url)) {
          return getImageUrl(item.url);
        }
      }
    }
    
    // If first is image, use it
    if (firstItem?.url && !isFirstVideo) {
      return getImageUrl(firstItem.url);
    }
    
    // Fallback: return first item even if video
    return firstItem?.url ? getImageUrl(firstItem.url) : null;
  };

  const mainImage = getFirstImage() || "";
  
  // Get second image for hover effect (skip the main image)
  const getSecondImage = () => {
    const mainImageIndex = mainImage ? 
      product.images?.findIndex(img => 
        img?.url && getImageUrl(img.url) === mainImage
      ) : -1;
    
    if (mainImageIndex >= 0 && product.images && product.images.length > mainImageIndex + 1) {
      const nextItem = product.images[mainImageIndex + 1];
      if (nextItem?.url && nextItem?.type !== 'video' && !/\.(mp4|webm|ogg|mov|m4v)$/i.test(nextItem.url)) {
        return getImageUrl(nextItem.url);
      }
    }
    
    // Try to find any other image
    if (product.images) {
      for (let i = 0; i < product.images.length; i++) {
        const item = product.images[i];
        const itemUrl = item?.url ? getImageUrl(item.url) : null;
        if (itemUrl && itemUrl !== mainImage && item?.type !== 'video' && 
            !/\.(mp4|webm|ogg|mov|m4v)$/i.test(item.url)) {
          return itemUrl;
        }
      }
    }
    
    return null;
  };

  const secondImage = getSecondImage();
  const price = product.price?.toFixed(0) || "0";
  const formattedPrice = new Intl.NumberFormat("ru-RU").format(price);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setMousePosition({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link
        to={`/product/${product.slug}`}
        className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden block relative"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setMousePosition({ x: 0, y: 0 });
        }}
        style={{
          transform: isHovered
            ? `translateY(-8px) translateX(${mousePosition.x}px) translateY(${mousePosition.y}px)`
            : "translateY(0)",
        }}
      >
        <div className="aspect-square overflow-hidden bg-gray-100 relative">
          {mainImage ? (
            <>
              <motion.img
                src={mainImage}
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0"
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  opacity: secondImage && isHovered ? 0 : 1,
                }}
                transition={{ duration: 0.5 }}
              />
              {secondImage && (
                <motion.img
                  src={secondImage}
                  alt={product.name}
                  className="w-full h-full object-cover absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    scale: isHovered ? 1.1 : 1,
                  }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-sm">Нет изображения</span>
            </div>
          )}
        </div>
        <div className="p-5">
          <motion.h3
            className="text-lg font-medium text-gray-800 mb-2 line-clamp-2"
            animate={{ color: isHovered ? "rgb(251, 113, 133)" : "#1f2937" }}
            transition={{ duration: 0.2 }}
          >
            {product.name}
          </motion.h3>
          {product.category?.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.category.description}
            </p>
          )}
          <div
            className="flex items-center justify-between pt-2 border-t"
            style={{ borderColor: "rgb(var(--color-border-light))" }}
          >
            <motion.span
              className="text-xl font-semibold text-primary"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {formattedPrice} сум
            </motion.span>
            {product.category && (
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                {product.category.name}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
