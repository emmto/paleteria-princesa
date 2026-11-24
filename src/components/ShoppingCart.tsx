import React, { useEffect, useRef, useState } from 'react';
import { useStore } from '@nanostores/react';
import {
  cartItems,
  cartTotal,
  totalQuantity,
  isCartOpen,
  initCartFromStorage,
  updateCartItemQuantity,
  updateFlavorQuantity,
  fillAssortedFlavors,
  removeCartItem,
  clearCart,
} from '../stores/cartStore';
import {
  generateWhatsAppLink,
  getItemTierProgress,
  type CartItem as CartItemType,
} from '../utils/cartLogic';
import { clsx } from 'clsx';

interface CartItemProps {
  itemKey: string;
  item: CartItemType;
}

const CartItem = ({ itemKey, item }: CartItemProps) => {
  const {
    tier,
    tierLabel,
    unitPrice,
    subtotal,
    nextTierLabel,
    missingForNext,
    nextUnitPrice,
    progressPercent,
  } = getItemTierProgress(item);

  const [qtyInput, setQtyInput] = useState(String(item.cantidad));

  useEffect(() => {
    setQtyInput(String(item.cantidad));
  }, [item.cantidad]);

  const totalSelected = item.seleccionSabores
    ? Object.values(item.seleccionSabores).reduce((a, b) => a + b, 0)
    : 0;
  const unselectedCount = item.cantidad - totalSelected;

  const [showFlavors, setShowFlavors] = useState(unselectedCount > 0);

  useEffect(() => {
    if (unselectedCount > 0) {
      setShowFlavors(true);
    } else {
      setShowFlavors(false);
    }
  }, [unselectedCount]);

  const handleQtyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setQtyInput(raw);
    if (raw.trim() === '') return;
    const parsed = parseInt(raw, 10);
    if (!Number.isNaN(parsed) && parsed >= 1) {
      updateCartItemQuantity(itemKey, Math.min(9999, parsed));
    }
  };

  const handleQtyBlur = () => {
    const parsed = parseInt(qtyInput, 10);
    if (Number.isNaN(parsed) || parsed < 1) {
      setQtyInput(String(item.cantidad));
      return;
    }
    const clamped = Math.min(9999, parsed);
    setQtyInput(String(clamped));
    if (clamped !== item.cantidad) {
      updateCartItemQuantity(itemKey, clamped);
    }
  };

  const tierBadgeStyle =
    tier === 'mayoreo'
      ? 'bg-pink-100 text-pink-700'
      : tier === 'medio'
        ? 'bg-blue-100 text-blue-700'
        : 'bg-green-100 text-green-700';

  const progressBarColor =
    tier === 'mayoreo'
      ? 'bg-gradient-to-r from-pink-500 to-pink-600'
      : tier === 'medio'
        ? 'bg-blue-500'
        : 'bg-green-500';

  return (
    <div className="flex flex-col gap-3 p-3.5 sm:p-4 border rounded-xl border-gray-200/80 bg-white shadow-sm">
      <div className="flex gap-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
          <img
            src={
              item.imagen ||
              `https://placehold.co/100x100/f3f4f6/db2777?text=${encodeURIComponent(item.nombre)}`
            }
            alt={item.nombre}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h2 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                  {item.nombre}
                </h2>
                <span
                  className={clsx(
                    'text-[10px] font-bold uppercase px-2 py-0.5 rounded-full whitespace-nowrap',
                    tierBadgeStyle
                  )}
                >
                  {tierLabel}
                </span>
              </div>

              {item.seleccionSabores && totalSelected > 0 && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {Object.entries(item.seleccionSabores)
                    .filter(([_, qty]) => qty > 0)
                    .map(([s, qty]) => `${qty} ${s}`)
                    .join(', ')}
                </p>
              )}

              {item.saboresDisponibles && !showFlavors && unselectedCount === 0 && (
                <button
                  type="button"
                  onClick={() => setShowFlavors(true)}
                  className="text-xs font-semibold text-pink-600 hover:text-pink-700 underline mt-1"
                >
                  Modificar sabores
                </button>
              )}

              {!item.saboresDisponibles && item.sabor && (
                <p className="text-xs text-gray-500">{item.sabor}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => removeCartItem(itemKey)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
              aria-label={`Eliminar ${item.nombre}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-700">
              <span className="text-red-600">${unitPrice.toFixed(2)} c/u</span>
              <span className="text-gray-400 mx-1">·</span>
              <span className="text-gray-900 font-bold">${subtotal.toFixed(2)}</span>
            </p>

            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
              <button
                type="button"
                className="min-w-[34px] min-h-[36px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors font-bold"
                onClick={() => updateCartItemQuantity(itemKey, item.cantidad - 1)}
                aria-label={`Disminuir cantidad de ${item.nombre}`}
              >
                -
              </button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={9999}
                value={qtyInput}
                onChange={handleQtyInputChange}
                onBlur={handleQtyBlur}
                aria-label={`Cantidad de ${item.nombre}`}
                className="w-12 min-h-[36px] text-center text-sm font-semibold bg-transparent text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                className="min-w-[34px] min-h-[36px] flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors font-bold"
                onClick={() => updateCartItemQuantity(itemKey, item.cantidad + 1)}
                aria-label={`Aumentar cantidad de ${item.nombre}`}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick tier jump & per-product tier progress */}
      <div className="space-y-1.5 pt-1 border-t border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-gray-600 font-medium leading-tight">
            {nextTierLabel
              ? `Faltan ${missingForNext} pz de este producto para ${nextTierLabel} ($${nextUnitPrice?.toFixed(2)})`
              : '¡Precio Mayoreo aplicado en este producto!'}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => updateCartItemQuantity(itemKey, 30)}
              disabled={item.cantidad >= 30}
              className={clsx(
                'px-2 py-0.5 text-[11px] font-bold rounded-md border transition-colors',
                item.cantidad >= 30
                  ? 'border-blue-200 bg-blue-50 text-blue-400 cursor-default'
                  : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50'
              )}
            >
              30 pz
            </button>
            <button
              type="button"
              onClick={() => updateCartItemQuantity(itemKey, 50)}
              disabled={item.cantidad >= 50}
              className={clsx(
                'px-2 py-0.5 text-[11px] font-bold rounded-md border transition-colors',
                item.cantidad >= 50
                  ? 'border-pink-200 bg-pink-50 text-pink-400 cursor-default'
                  : 'border-pink-200 bg-white text-pink-700 hover:bg-pink-50'
              )}
            >
              50 pz
            </button>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
          <div
            className={clsx('h-full rounded-full transition-all duration-300', progressBarColor)}
            style={{ width: `${Math.min(Math.max(progressPercent, 4), 100)}%` }}
          />
        </div>
      </div>

      {/* Selector de Sabores */}
      {item.saboresDisponibles && showFlavors && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-gray-500 uppercase">Elige sabores</span>
            <div className="flex items-center gap-2">
              {unselectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => fillAssortedFlavors(itemKey)}
                  className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Repartir surtido
                </button>
              )}
              <span
                className={clsx(
                  'text-xs font-bold',
                  unselectedCount > 0 ? 'text-orange-600' : 'text-green-600'
                )}
              >
                {unselectedCount > 0 ? `Faltan ${unselectedCount}` : '¡Completo!'}
              </span>
              {unselectedCount === 0 && (
                <button
                  type="button"
                  onClick={() => setShowFlavors(false)}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                  aria-label="Ocultar sabores"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {item.saboresDisponibles.map(sabor => {
              const qty = item.seleccionSabores?.[sabor] || 0;
              return (
                <div key={sabor} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{sabor}</span>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => updateFlavorQuantity(itemKey, sabor, -1)}
                      className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-colors font-bold',
                        qty > 0
                          ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      )}
                      disabled={qty <= 0}
                      aria-label={`Quitar ${sabor}`}
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-medium">{qty}</span>
                    <button
                      type="button"
                      onClick={() => updateFlavorQuantity(itemKey, sabor, 1)}
                      className={clsx(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-colors font-bold',
                        unselectedCount > 0
                          ? 'bg-white border border-gray-300 text-green-600 hover:border-green-500 hover:text-green-700'
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      )}
                      disabled={unselectedCount <= 0}
                      aria-label={`Agregar ${sabor}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {unselectedCount === 0 && (
            <button
              type="button"
              onClick={() => setShowFlavors(false)}
              className="w-full mt-3 py-1.5 bg-green-100 text-green-700 text-xs font-bold rounded uppercase hover:bg-green-200 transition-colors"
            >
              Listo - Ocultar Sabores
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default function ShoppingCart() {
  const $cartItems = useStore(cartItems);
  const $totalQuantity = useStore(totalQuantity);
  const $cartTotal = useStore(cartTotal);
  const $isOpen = useStore(isCartOpen);
  const [mounted, setMounted] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const displayItems = mounted ? Object.entries($cartItems) : [];
  const displayQty = mounted ? $totalQuantity : 0;
  const displayTotal = mounted ? $cartTotal : 0;

  useEffect(() => {
    setMounted(true);
    initCartFromStorage();
  }, []);

  // Sync nanostore open state with native <dialog> top-layer modal
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if ($isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!$isOpen && dialog.open) {
      dialog.close();
    }
  }, [$isOpen]);

  // Listen to native close (Esc, back gesture, closedby="any") and Safari backdrop click fallback
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      isCartOpen.set(false);
    };
    dialog.addEventListener('close', handleClose);

    let cleanupPointerFallback: (() => void) | undefined;
    if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
      let pressedOutside = false;
      const isOutside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = isOutside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && isOutside(e)) {
          dialog.close();
        }
        pressedOutside = false;
      };
      dialog.addEventListener('pointerdown', onPointerDown);
      dialog.addEventListener('pointerup', onPointerUp);
      cleanupPointerFallback = () => {
        dialog.removeEventListener('pointerdown', onPointerDown);
        dialog.removeEventListener('pointerup', onPointerUp);
      };
    }

    return () => {
      dialog.removeEventListener('close', handleClose);
      cleanupPointerFallback?.();
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-drawer-title"
      {...({ closedby: 'any' } as Record<string, string>)}
      className="cart-dialog"
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <h1 id="cart-drawer-title" className="text-xl font-bold text-gray-900">
            Tu Pedido
          </h1>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
            {displayQty} pz
          </span>
        </div>

        <div className="flex items-center gap-2">
          {displayItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs font-semibold text-gray-500 hover:text-red-600 px-2.5 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
            >
              Vaciar
            </button>
          )}
          <button
            type="button"
            onClick={() => isCartOpen.set(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar panel"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Per-product pricing info banner */}
      {displayItems.length > 0 && (
        <div className="px-4 sm:px-6 py-2.5 bg-blue-50/70 border-b border-blue-100 text-xs text-blue-800 font-medium flex-shrink-0">
          El precio de medio mayoreo (30+) y mayoreo (50+) aplica por cada tipo de producto.
        </div>
      )}

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {displayItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-70 py-12">
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
            <button
              type="button"
              onClick={() => isCartOpen.set(false)}
              className="text-blue-600 font-semibold hover:underline"
            >
              Continuar comprando
            </button>
          </div>
        ) : (
          displayItems.map(([key, item]) => <CartItem key={key} itemKey={key} item={item} />)
        )}
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-6 pt-4 pb-[calc(1.25rem+env(safe-area-inset-bottom))] bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex-shrink-0">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
          <span>Total de piezas</span>
          <span className="font-semibold text-gray-700">{displayQty} pz</span>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 font-semibold">Total Estimado</span>
          <span className="text-2xl font-black text-gray-900">${displayTotal.toFixed(2)}</span>
        </div>
        <a
          href={generateWhatsAppLink(mounted ? Object.values($cartItems) : [], displayTotal)}
          target="_blank"
          rel="noopener noreferrer"
          aria-disabled={displayItems.length === 0}
          className={clsx(
            'flex items-center justify-center w-full py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300',
            displayItems.length === 0
              ? 'bg-gray-200 text-gray-400 pointer-events-none shadow-none'
              : 'bg-green-500 text-white hover:bg-green-600 hover:-translate-y-0.5 hover:shadow-green-200'
          )}
        >
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
          Pedir por WhatsApp
        </a>
      </div>
    </dialog>
  );
}
