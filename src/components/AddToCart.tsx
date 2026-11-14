import React, { useState } from 'react';
import type { CartItemInput } from '../stores/cartStore';
import { addCartItem } from '../stores/cartStore';
import { showToast } from '../stores/toastStore';

interface Props {
  product: {
    id: string;
    nombre: string;
    imagen?: string;
    precios: { menudeo: number; medio: number; mayoreo: number };
    sabores?: string[];
    permiteVariado: boolean;
  };
}

export default function AddToCart({ product }: Props) {
  const [isAdded, setIsAdded] = useState(false);
  
  const handleAdd = () => {
    const item: CartItemInput = {
      id: product.id,
      nombre: product.nombre,
      imagen: product.imagen,
      cantidad: 1,
      precios: product.precios,
      saboresDisponibles: product.permiteVariado && product.sabores ? product.sabores : undefined
    };
    addCartItem(item);
    showToast(`Agregaste ${product.nombre} al carrito`);
    
    // Feedback animation
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <div className="space-y-3">
      <button 
        onClick={handleAdd}
        disabled={isAdded}
        className={`w-full font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
            isAdded 
            ? 'bg-green-500 text-white scale-95' 
            : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-200 text-white'
        }`}
      >
        {isAdded ? (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>¡Agregado!</span>
            </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span>Agregar</span>
            </>
        )}
      </button>
    </div>
  );
}