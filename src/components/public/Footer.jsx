import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supportService } from '../../services/support.service';
import { newsletterService } from '../../services/newsletter.service';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [showSupportForm, setShowSupportForm] = useState(false);
  const currentYear = new Date().getFullYear();

  const newsletterMutation = useMutation({
    mutationFn: (email) => newsletterService.subscribe(email),
    onSuccess: () => {
      alert('Спасибо за подписку!');
      setEmail('');
    },
    onError: (error) => {
      const message = error.response?.data?.error || error.response?.data?.message || 'Ошибка при подписке';
      alert(message);
    },
  });

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    newsletterMutation.mutate(email);
  };

  const supportMutation = useMutation({
    mutationFn: (data) => supportService.createSupportMessage(data),
    onSuccess: () => {
      alert('Ваше сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
      setSupportEmail('');
      setSupportMessage('');
      setShowSupportForm(false);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Ошибка при отправке сообщения');
    },
  });

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    supportMutation.mutate({
      email: supportEmail,
      message: supportMessage,
    });
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <Link to="/" className="mb-4 inline-block">
              <img
                src="/lightSadia.png"
                alt="Sadia.lux"
                className="h-10 w-auto"
                onError={(e) => {
                  e.target.src = '/pinkSadia.png';
                }}
              />
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              Элегантная одежда для современной мусульманки. Стиль, качество и скромность в каждой детали.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Быстрые ссылки</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-rose-400 transition-colors text-sm">
                  Главная
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-rose-400 transition-colors text-sm">
                  О нас
                </Link>
              </li>
              <li>
                <Link to="/shop" className="hover:text-rose-400 transition-colors text-sm">
                  Каталог
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-rose-400 transition-colors text-sm">
                  Контакты
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Контакты</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a 
                  href="https://maps.app.goo.gl/zK5Kx1fRqzKwaBVa9" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:text-primary transition-colors"
                >
                  ул. Бешкайрагоч 42, Ташкент, 100042
                </a>
              </li>
              <li>
                <a href="tel:+998903464546" className="hover:text-primary transition-colors">
                  +998 90 346 45 46
                </a>
              </li>
              <li>
                <a href="mailto:info@sadia.lux" className="hover:text-primary transition-colors">
                  info@sadia.lux
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">Подписка на новости</h3>
            <p className="text-sm mb-4">
              Получайте информацию о новых коллекциях и специальных предложениях
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Ваш email"
                required
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={newsletterMutation.isPending}
                className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
              >
                {newsletterMutation.isPending ? 'Подписка...' : 'Подписаться'}
              </button>
            </form>
          </div>
        </div>

        {/* Support Section */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => setShowSupportForm(!showSupportForm)}
              className="w-full bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors font-medium mb-4"
            >
              {showSupportForm ? 'Скрыть форму поддержки' : 'Связаться с поддержкой'}
            </button>
            
            {showSupportForm && (
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">Форма обратной связи</h3>
                <form onSubmit={handleSupportSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Ваш email *</label>
                    <input
                      type="email"
                      required
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">Сообщение *</label>
                    <textarea
                      required
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      rows={4}
                      placeholder="Опишите ваш вопрос или проблему..."
                      minLength={10}
                      maxLength={2000}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-primary text-white placeholder-gray-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      {supportMessage.length}/2000 символов
                    </p>
                  </div>
                  <button
                    type="submit"
                    disabled={supportMutation.isPending}
                    className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
                  >
                    {supportMutation.isPending ? 'Отправка...' : 'Отправить сообщение'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Social Media & Copyright */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm">
              &copy; {currentYear} Sadia.lux. Все права защищены.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/sadia.lux/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/p/Sadialux-100063890390305/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@Sadia_lux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="YouTube"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

