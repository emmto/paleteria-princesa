import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { cartItems, totalQuantity, isCartOpen, removeCartItem, updateCartItemQuantity } from '../stores/cartStore';
import { getPrecioUnitario, generateWhatsAppLink, getPriceTier } from '../utils/cartLogic';
import { clsx } from 'clsx';

export default function ShoppingCart() {
  const $cartItems = useStore(cartItems);
  const $totalQuantity = useStore(totalQuantity);
  const $isOpen = useStore(isCartOpen);
  const cartRef = useRef<HTMLDivElement>(null);

  const items = Object.entries($cartItems);
  const currentTier = getPriceTier($totalQuantity);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') isCartOpen.set(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const total = items.reduce((acc, [_, item]) => {
    const unitPrice = getPrecioUnitario($totalQuantity, item.precios);
    return acc + (unitPrice * item.cantidad);
  }, 0);

  // Progress Bar Logic
  const getProgress = () => {
      if ($totalQuantity < 30) return ($totalQuantity / 30) * 100;
      if ($totalQuantity < 50) return (($totalQuantity - 30) / 20) * 100;
      return 100;
  };
  
  const getNextGoalText = () => {
      if ($totalQuantity < 30) return `Faltan ${30 - $totalQuantity} para precio Medio`;
      if ($totalQuantity < 50) return `Faltan ${50 - $totalQuantity} para precio Mayoreo`;
      return "¡Excelente! Tienes el mejor precio.";
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          $isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => isCartOpen.set(false)}
      />

      {/* Slide-over panel */}
      <div 
        className={clsx(
          "fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          $isOpen ? "translate-x-0" : "translate-x-full"
        )}
        ref={cartRef}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold text-gray-900">Tu Pedido</h2>
          <button 
            onClick={() => isCartOpen.set(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
          >
            <span className="sr-only">Cerrar panel</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Progress Section */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">Nivel: <span className={clsx(
                "uppercase font-bold",
                currentTier === 'menudeo' ? "text-green-600" : 
                currentTier === 'medio' ? "text-blue-600" : "text-pink-600"
            )}>{currentTier}</span></span>
            <span className="text-gray-900">{$totalQuantity} pz</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
                className={clsx(
                    "h-full rounded-full transition-all duration-500 ease-out",
                    currentTier === 'menudeo' ? "bg-green-400" : 
                    currentTier === 'medio' ? "bg-blue-500" : "bg-gradient-to-r from-pink-500 to-pink-600"
                )}
                style={{ width: `${Math.min(getProgress(), 100)}%` }}
            />
          </div>
          <p className="text-xs text-center mt-2 text-gray-500 font-medium">
            {getNextGoalText()}
          </p>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
                <button onClick={() => isCartOpen.set(false)} className="text-pink-600 font-medium hover:underline">Continuar comprando</button>
            </div>
          ) : (
            items.map(([key, item]) => {
                const unitPrice = getPrecioUnitario($totalQuantity, item.precios);
                return (
                    <div key={key} className="flex gap-4 animate-fade-in">
                        <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                             <img 
                                src={`https://placehold.co/100x100/f3f4f6/db2777?text=${encodeURIComponent(item.nombre)}`} 
                                alt={item.nombre} 
                                className="w-full h-full object-cover"
                             />
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-gray-900 line-clamp-1">{item.nombre}</h3>
                                {item.sabor && <p className="text-sm text-gray-500">{item.sabor}</p>}
                            </div>
                            <div className="flex items-end justify-between">
                                <p className="font-medium text-red-600">${unitPrice.toFixed(2)}</p>
                                <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                                        onClick={() => updateCartItemQuantity(key, item.cantidad - 1)}
                                    >-</button>
                                    <span className="w-8 text-center text-sm font-semibold">{item.cantidad}</span>
                                    <button 
                                        className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                                        onClick={() => updateCartItemQuantity(key, item.cantidad + 1)}
                                    >+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-6 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-500 font-medium">Total Estimado</span>
            <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
          </div>
          <a 
            href={generateWhatsAppLink(Object.values($cartItems), total)}
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
                "flex items-center justify-center w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300 transform",
                items.length === 0 
                    ? "bg-gray-200 text-gray-400 pointer-events-none shadow-none" 
                    : "bg-green-500 text-white hover:bg-green-600 hover:-translate-y-1 hover:shadow-green-200"
            )}
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}