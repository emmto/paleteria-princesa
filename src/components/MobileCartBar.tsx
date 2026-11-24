import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { totalQuantity, cartTotal, isCartOpen, initCartFromStorage } from '../stores/cartStore';

export default function MobileCartBar() {
  const $totalQuantity = useStore(totalQuantity);
  const $cartTotal = useStore(cartTotal);
  const $isOpen = useStore(isCartOpen);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    initCartFromStorage();
  }, []);

  if (!mounted || $totalQuantity === 0 || $isOpen) return null;

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-30 px-4 pt-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pointer-events-none">
      <button
        type="button"
        onClick={() => isCartOpen.set(true)}
        className="pointer-events-auto w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-2xl shadow-xl shadow-blue-900/20 px-4 py-3.5 flex items-center justify-between transition-all"
      >
        <div className="flex items-center gap-3">
          <span className="bg-white/20 text-white text-xs font-extrabold px-2.5 py-1 rounded-full">
            {$totalQuantity} pz
          </span>
          <span className="font-extrabold text-base">${$cartTotal.toFixed(2)}</span>
        </div>
        <span className="font-bold text-sm flex items-center gap-1">
          Ver pedido
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </button>
    </div>
  );
}
