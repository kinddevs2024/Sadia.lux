const SizeSelector = ({ sizes, selectedSize, onSizeChange, inventory = [] }) => {
  const getAvailableQuantity = (size) => {
    const invItem = inventory.find((inv) => inv.size === size);
    return invItem?.quantity || 0;
  };

  // Сортируем размеры: сначала буквенные (S, M, L, XL), потом числовые
  const sortedSizes = [...sizes].sort((a, b) => {
    const aIsNumber = !isNaN(parseInt(a.trim()));
    const bIsNumber = !isNaN(parseInt(b.trim()));
    if (aIsNumber && !bIsNumber) return 1;
    if (!aIsNumber && bIsNumber) return -1;
    if (aIsNumber && bIsNumber) return parseInt(a.trim()) - parseInt(b.trim());
    // Для буквенных размеров используем стандартный порядок
    const sizeOrder = { 'XS': 0, 'S': 1, 'M': 2, 'L': 3, 'XL': 4, 'XXL': 5, 'XXXL': 6 };
    return (sizeOrder[a.trim().toUpperCase()] ?? 99) - (sizeOrder[b.trim().toUpperCase()] ?? 99);
  });

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Выберите размер
      </label>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {sortedSizes.map((size) => {
          const available = getAvailableQuantity(size);
          const isSelected = selectedSize === size;
          const isOutOfStock = available === 0;

          return (
            <button
              key={size}
              type="button"
              onClick={() => !isOutOfStock && onSizeChange(size)}
              disabled={isOutOfStock}
              className={`
                px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                ${
                  isSelected
                    ? 'bg-primary text-white ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800'
                    : isOutOfStock
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600'
                }
              `}
              title={isOutOfStock ? 'Нет в наличии' : `${available} шт.`}
            >
              {size.trim()}
              {!isOutOfStock && available > 0 && (
                <span className="block text-xs mt-0.5 opacity-75">({available})</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;

