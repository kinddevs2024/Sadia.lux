import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../utils/imageUtils';

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCart();

  const handleQuantityChange = (newQuantity) => {
    updateQuantity(item.productId, item.size, newQuantity);
  };

  const handleRemove = () => {
    removeFromCart(item.productId, item.size);
  };

  const subtotal = (item.price * item.quantity).toFixed(2);
  const imageUrl = item.product?.images?.[0]?.url;
  const mainImage = imageUrl ? getImageUrl(imageUrl) : '';

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {mainImage ? (
        <img
          src={mainImage}
          alt={item.product?.name || 'Product'}
          className="w-20 h-20 object-cover rounded"
        />
      ) : (
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <span className="text-gray-400 text-xs">Нет</span>
        </div>
      )}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          {item.product?.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Размер: {item.size}</p>
        <p className="text-lg font-bold text-primary mt-1">
          {Number(item.price).toFixed(2)} сум
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleQuantityChange(item.quantity - 1)}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
        >
          -
        </button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <button
          onClick={() => handleQuantityChange(item.quantity + 1)}
          className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center justify-center"
        >
          +
        </button>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900 dark:text-white">{subtotal} сум</p>
        <button
          onClick={handleRemove}
          className="text-sm text-red-600 hover:text-red-800 mt-1"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default CartItem;

