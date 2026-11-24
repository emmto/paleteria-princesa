import React, { useState } from 'react';
import type { CartItemInput } from '../stores/cartStore';
import { addCartItem } from '../stores/cartStore';
import { showToast } from '../stores/toastStore';
import { clsx } from 'clsx';

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

const PRESET_QUANTITIES = [10, 30, 50];

export default function AddToCart({ product }: Props) {
  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState('1');
  const [isAdded, setIsAdded] = useState(false);

  const setQuantityValue = (next: number) => {
    const clamped = Math.min(9999, Math.max(1, Math.floor(next)));
    setQty(clamped);
    setQtyInput(String(clamped));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setQtyInput(raw);
    if (raw.trim() === '') return;
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      setQty(Math.min(9999, parsed));
    }
  };

  const handleInputBlur = () => {
    const parsed = parseInt(qtyInput, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setQuantityValue(1);
      return;
    }
    setQuantityValue(parsed);
  };

  const handleAdd = () => {
    const finalQty = Math.min(9999, Math.max(1, qty));
    const item: CartItemInput = {
      id: product.id,
      nombre: product.nombre,
      imagen: product.imagen,
      cantidad: finalQty,
      precios: product.precios,
      saboresDisponibles: product.permiteVariado && product.sabores ? product.sabores : undefined,
    };
    addCartItem(item);
    showToast(
      finalQty > 1
        ? `Agregaste ${finalQty}x ${product.nombre} al carrito`
        : `Agregaste ${product.nombre} al carrito`
    );

    setQuantityValue(1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  return (
    <div className="space-y-2.5 mt-2">
      {/* Compact quantity selector + wholesale shortcuts */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
          <button
            type="button"
            onClick={() => setQuantityValue(qty - 1)}
            disabled={qty <= 1}
            className="w-8 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-40 rounded-l-lg transition-colors font-bold"
            aria-label={`Disminuir cantidad de ${product.nombre}`}
          >
            -
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={9999}
            value={qtyInput}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            aria-label={`Cantidad de ${product.nombre}`}
            className="w-11 h-9 text-center text-sm font-bold bg-transparent text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button
            type="button"
            onClick={() => setQuantityValue(qty + 1)}
            className="w-8 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors font-bold"
            aria-label={`Aumentar cantidad de ${product.nombre}`}
          >
            +
          </button>
        </div>

        <div className="flex items-center gap-1">
          {PRESET_QUANTITIES.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setQuantityValue(preset)}
              className={clsx(
                'px-2 py-1.5 text-xs font-bold rounded-lg border transition-colors',
                qty === preset
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              +{preset}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleAdd}
        disabled={isAdded}
        className={clsx(
          'w-full font-bold py-2.5 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
          isAdded
            ? 'bg-green-500 text-white scale-95'
            : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 shadow-lg shadow-blue-200 text-white'
        )}
      >
        {isAdded ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <span>¡Agregado!</span>
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
            </svg>
            <span>{qty > 1 ? `Agregar (${qty})` : 'Agregar'}</span>
          </>
        )}
      </button>
    </div>
  );
}
