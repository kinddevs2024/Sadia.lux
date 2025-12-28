import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ message, linkText, linkTo, onClose, duration = 5000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[300px] max-w-md">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {message}
            </p>
            {linkText && linkTo && (
              <Link
                to={linkTo}
                onClick={onClose}
                className="mt-2 inline-block text-sm text-primary hover:text-primary-dark font-medium"
              >
                {linkText} →
              </Link>
            )}
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

