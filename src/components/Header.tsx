import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { totalQuantity, isCartOpen, initCartFromStorage } from '../stores/cartStore';

const NAV_LINKS = [
  { href: '#catalogo', label: 'Catálogo' },
  { href: '#politica', label: 'Precios' },
  { href: '#eventos', label: 'Eventos' },
  { href: '#faq', label: 'Preguntas' },
  { href: '#nosotros', label: 'Contacto' },
];

export default function Header() {
  const $totalQuantity = useStore(totalQuantity);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initCartFromStorage();
  }, []);

  const badgeQty = mounted ? $totalQuantity : 0;

  return (
    <header className="fixed w-full top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <a
            href="/"
            className="flex items-center gap-2.5 flex-shrink-0"
            onClick={() => setMobileMenuOpen(false)}
          >
            <img
              src="/img/logo/logo.png"
              alt="Helados la Princesa"
              className="h-9 sm:h-10 w-auto object-contain"
            />
            <span className="text-base sm:text-xl font-black tracking-tight uppercase italic text-blue-600">
              Helados la Princesa
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden md:flex items-center space-x-6" aria-label="Navegación principal">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-blue-600 text-sm font-bold uppercase tracking-wide transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => isCartOpen.set(true)}
              className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors group"
              aria-label="Abrir carrito"
            >
              <div className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full transform group-hover:scale-110 transition-transform">
                {badgeQty}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="md:hidden p-2 -mr-2 text-gray-700 hover:text-blue-600 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label="Menú de navegación"
            >
              {mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          className="md:hidden border-t border-gray-100 bg-white px-4 py-2 shadow-lg"
          aria-label="Navegación móvil"
        >
          <div className="flex flex-col divide-y divide-gray-100">
            {NAV_LINKS.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-3 text-sm font-bold uppercase tracking-wide text-gray-700 hover:text-blue-600"
              >
                {link.label}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
