import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { totalQuantity, isCartOpen } from '../stores/cartStore';

export default function Header() {
  const $totalQuantity = useStore(totalQuantity);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className={`text-2xl font-black tracking-tight uppercase italic ${isScrolled ? 'text-blue-600' : 'text-blue-600'}`}>
              Helados la Princesa
            </a>
          </div>
          <div className="flex items-center space-x-6">
             <nav className="hidden md:flex space-x-8">
                <a href="#catalogo" className="text-gray-700 hover:text-blue-600 text-sm font-bold uppercase tracking-wide">Catálogo</a>
                <a href="#nosotros" className="text-gray-700 hover:text-blue-600 text-sm font-bold uppercase tracking-wide">Nosotros</a>
             </nav>
             <button 
                onClick={() => isCartOpen.set(true)}
                className="relative p-2 text-gray-600 hover:text-blue-500 transition-colors group"
                aria-label="Abrir carrito"
             >
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full transform group-hover:scale-110 transition-transform">
                   {$totalQuantity}
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
             </button>
          </div>
        </div>
      </div>
    </header>
  );
}
