import { atom, map, computed } from 'nanostores';
import type { CartItem, Precios } from '../utils/cartLogic';

export type CartItemInput = Omit<CartItem, 'precios'> & { precios: Precios };

const CART_STORAGE_KEY = 'paleteria-princesa-cart';
let isStorageInitialized = false;

// Key is the product ID
export const cartItems = map<Record<string, CartItem>>({});

export const isCartOpen = atom<boolean>(false);

export function initCartFromStorage() {
    if (isStorageInitialized || typeof window === 'undefined') return;
    isStorageInitialized = true;

    try {
        const raw = window.localStorage.getItem(CART_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                cartItems.set(parsed);
            }
        }
    } catch {
        // Ignore corrupted or blocked storage
    }

    cartItems.listen((items) => {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
        } catch {
            // Ignore storage quota / privacy mode errors
        }
    });
}

export function addCartItem(item: CartItemInput) {
  const existingItems = cartItems.get();
  const key = item.id;

  if (existingItems[key]) {
    cartItems.setKey(key, {
        ...existingItems[key],
        cantidad: existingItems[key].cantidad + item.cantidad
    });
  } else {
    cartItems.setKey(key, { 
        ...item, 
        id: item.id,
        seleccionSabores: item.saboresDisponibles ? {} : undefined 
    });
  }
}

export function updateFlavorQuantity(itemId: string, flavor: string, delta: number) {
    const item = cartItems.get()[itemId];
    if (!item || !item.seleccionSabores) return;

    const currentQty = item.seleccionSabores[flavor] || 0;
    const newQty = currentQty + delta;
    
    if (newQty < 0) return;

    const totalSelected = Object.values(item.seleccionSabores).reduce((a, b) => a + b, 0);
    
    // Allow increment only if we haven't reached the limit
    if (delta > 0 && (totalSelected + delta) > item.cantidad) {
        return;
    }

    const newSelection = { ...item.seleccionSabores };
    if (newQty === 0) {
        delete newSelection[flavor];
    } else {
        newSelection[flavor] = newQty;
    }
    
    cartItems.setKey(itemId, { ...item, seleccionSabores: newSelection });
}

export function removeCartItem(key: string) {
    const current = cartItems.get();
    const { [key]: _, ...rest } = current;
    cartItems.set(rest);
}

export function updateCartItemQuantity(key: string, quantity: number) {
    const item = cartItems.get()[key];
    if (quantity <= 0) {
        removeCartItem(key);
        return;
    }
    if (!item) return;

    let updatedFlavors = item.seleccionSabores;
    if (updatedFlavors) {
        const totalSelected = Object.values(updatedFlavors).reduce((a, b) => a + b, 0);
        if (totalSelected > quantity) {
            let excess = totalSelected - quantity;
            const trimmed = { ...updatedFlavors };
            for (const [flavor, qty] of Object.entries(trimmed)) {
                if (excess <= 0) break;
                const reduction = Math.min(qty, excess);
                const nextQty = qty - reduction;
                if (nextQty <= 0) {
                    delete trimmed[flavor];
                } else {
                    trimmed[flavor] = nextQty;
                }
                excess -= reduction;
            }
            updatedFlavors = trimmed;
        }
    }

    cartItems.setKey(key, {
        ...item,
        cantidad: quantity,
        ...(updatedFlavors !== undefined ? { seleccionSabores: updatedFlavors } : {}),
    });
}

export const totalQuantity = computed(cartItems, items => {
    return Object.values(items).reduce((sum, item) => sum + item.cantidad, 0);
});