import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../../services/product.service';
import ProductCard from '../../components/public/ProductCard';
import ReviewsSection from '../../components/public/ReviewsSection';
import AudioPlayer from '../../components/public/AudioPlayer';
import { ShoppingBagIcon, CheckCircleIcon, TruckIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Analytics } from '@vercel/analytics/react';

const Home = () => {
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productService.getProducts({ limit: 6 }),
  });

  const products = productsData?.data?.data || [];

  // Instagram feed images
  const instagramPosts = [
    {
      id: 1,
      imageUrl: '/gallery_img1.jpg',
      postUrl: 'https://www.instagram.com/sadia.lux/'
    },
    {
      id: 2,
      imageUrl: '/gallery_img2.jpg',
      postUrl: 'https://www.instagram.com/sadia.lux/'
    },
    {
      id: 3,
      imageUrl: '/gallery_img3.jpg',
      postUrl: 'https://www.instagram.com/sadia.lux/'
    },
    {
      id: 4,
      imageUrl: '/gallery_img4.jpg',
      postUrl: 'https://www.instagram.com/sadia.lux/'
    }
  ];

  return (
    <div className="min-h-screen">
      <AudioPlayer />
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden" style={{ background: 'linear-gradient(to bottom right, rgb(var(--color-pastel-rose)), rgb(var(--color-pastel-pink)), rgb(var(--color-pastel-beige)))' }}>
        <div className="absolute inset-0 opacity-20">
          <img
            src="/Sadiabg.gif"
            alt="Background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-light mb-6 tracking-tight" style={{ color: 'rgb(var(--color-text-primary))' }}>
            Стиль и скромность
            <br />
            <span className="font-serif italic text-primary">для каждой женщины</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
            Коллекция элегантной одежды для современной мусульманки
          </p>
          <Link
            to="/shop"
            className="inline-block bg-primary text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-primary-dark transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
          >
            Смотреть коллекцию
          </Link>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-light mb-6" style={{ color: 'rgb(var(--color-text-primary))' }}>
                О бренде <span className="font-serif italic text-primary">Sadia.lux</span>
              </h2>
              <p className="text-lg text-gray-600 mb-4 leading-relaxed">
                Sadia.lux — это бренд одежды, созданный специально для современных мусульманок, 
                которые ценят стиль, качество и соблюдают принципы скромности. Наша миссия — 
                помочь каждой женщине выразить свою индивидуальность через элегантную и 
                соответствующую исламским нормам одежду.
              </p>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Мы тщательно отбираем ткани, следим за качеством пошива и создаем коллекции, 
                которые вдохновляют и делают каждую женщину уверенной в себе.
              </p>
              <Link
                to="/about"
                className="inline-block text-primary border-2 border-primary px-8 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all duration-300"
              >
                Узнать больше
              </Link>
            </div>
            <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/SadiaLogo.png"
                alt="Sadia.lux"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>
              Популярные товары
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Выберите из нашей коллекции элегантных платьев, блузок и аксессуаров
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg aspect-square" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="text-center">
                <Link
                  to="/shop"
                  className="inline-block bg-rose-400 text-white px-10 py-4 rounded-full font-medium text-lg hover:bg-rose-500 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  Все товары
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-600 py-12">
              <p className="text-lg">Товары скоро появятся</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Us / Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>
              Почему выбирают нас
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6 rounded-2xl hover:bg-rose-50 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                <ShoppingBagIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Высокое качество</h3>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                Мы используем только премиальные ткани и тщательно контролируем каждый этап производства
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-rose-50 transition-all duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                <CheckCircleIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Современные модели</h3>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                Актуальные коллекции, сочетающие модные тренды с принципами скромности
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-primary-light transition-all duration-300" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                <TruckIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Доставка по Узбекистану</h3>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                Быстрая и надежная доставка в любой город страны
              </p>
            </div>
            
            <div className="text-center p-6 rounded-2xl hover:bg-primary-light transition-all duration-300" style={{ backgroundColor: 'rgb(var(--color-bg-primary))' }}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-light rounded-full mb-4">
                <ArrowPathIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2" style={{ color: 'rgb(var(--color-text-primary))' }}>Удобный возврат</h3>
              <p style={{ color: 'rgb(var(--color-text-secondary))' }}>
                Простая процедура возврата и обмена товара в течение 14 дней
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <ReviewsSection />

      {/* Social Media Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-light mb-4" style={{ color: 'rgb(var(--color-text-primary))' }}>
              Следите за нами в социальных сетях
            </h2>
            <p className="text-lg mb-8" style={{ color: 'rgb(var(--color-text-secondary))' }}>
              Новые коллекции, стилизация и вдохновение каждый день
            </p>
            <div className="flex justify-center gap-6 mb-12">
              <a
                href="https://www.instagram.com/sadia.lux?igsh=bGhuZWM2ZjZ0djZ4"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/p/Sadialux-100063890390305/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@Sadia_lux"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-300 hover:shadow-lg"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Instagram Feed Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={post.postUrl || "https://www.instagram.com/sadia.lux/"}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square bg-gray-200 rounded-lg overflow-hidden hover:opacity-80 transition-opacity cursor-pointer group relative"
              >
                <img
                  src={post.imageUrl}
                  alt={`Instagram post ${post.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
      <Analytics />
    </div>
  );
};

export default Home;
