import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";

const ProductCard = ({ product, index = 0 }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    // For uploaded files, use backend URL
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const baseUrl = apiUrl.replace("/api", "");
    return url.startsWith("/") ? `${baseUrl}${url}` : `${baseUrl}/${url}`;
  };

  const mainImage = product.images?.[0]?.url
    ? getImageUrl(product.images[0].url)
    : "";
  const secondImage = product.images?.[1]?.url
    ? getImageUrl(product.images[1].url)
    : null;
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
            animate={{ color: isHovered ? "rgb(var(--color-primary))" : "#1f2937" }}
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
