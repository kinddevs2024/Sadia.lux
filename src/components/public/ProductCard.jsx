import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
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
  const price = product.price?.toFixed(0) || "0";
  const formattedPrice = new Intl.NumberFormat("ru-RU").format(price);

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
    >
      <div className="aspect-square overflow-hidden bg-gray-100">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Нет изображения</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        {product.category?.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {product.category.description}
          </p>
        )}
        <div
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: "rgb(var(--color-border-light))" }}
        >
          <span className="text-xl font-semibold text-primary">
            {formattedPrice} сум
          </span>
          {product.category && (
            <span className="text-xs text-gray-500 uppercase tracking-wide">
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
