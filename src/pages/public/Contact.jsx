import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-light mb-4 text-center" style={{ color: 'rgb(var(--color-text-primary))' }}>
            Свяжитесь с нами
          </h1>
          <p className="text-lg text-center mb-12" style={{ color: 'rgb(var(--color-text-secondary))' }}>
            Мы всегда рады ответить на ваши вопросы и помочь с выбором
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Contact Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-light text-gray-800 mb-6">Напишите нам</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Имя *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Сообщение *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
                >
                  Отправить сообщение
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h2 className="text-2xl font-light text-gray-800 mb-6">Контактная информация</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Адрес</h3>
                    <a 
                      href="https://maps.app.goo.gl/zK5Kx1fRqzKwaBVa9" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-dark block"
                    >
                      ул. Бешкайрагоч 42, Ташкент, 100042
                    </a>
                    <p className="text-gray-600 text-sm mt-1">Узбекистан</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Телефон</h3>
                    <a href="tel:+998903464546" className="text-primary hover:text-primary-dark">
                      +998 90 346 45 46
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Email</h3>
                    <a href="mailto:info@sadia.lux" className="text-primary hover:text-primary-dark">
                      info@sadia.lux
                    </a>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-4">Социальные сети</h3>
                    <div className="flex space-x-4">
                      <a
                        href="https://www.instagram.com/sadia.lux/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.facebook.com/p/Sadialux-100063890390305/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.youtube.com/@Sadia_lux"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default Contact;

