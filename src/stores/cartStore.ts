import { atom, map, computed } from 'nanostores';
import { getCartTotal, type CartItem, type Precios } from '../utils/cartLogic';

export type CartItemInput = Omit<CartItem, 'precios'> & { precios: Precios };

const CART_STORAGE_KEY = 'paleteria-princesa-cart';
const MAX_ITEM_QUANTITY = 9999;
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
  const safeQty = Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(item.cantidad)));
  const existingItems = cartItems.get();
  const key = item.id;

  if (existingItems[key]) {
    cartItems.setKey(key, {
        ...existingItems[key],
        cantidad: Math.min(MAX_ITEM_QUANTITY, existingItems[key].cantidad + safeQty)
    });
  } else {
    cartItems.setKey(key, { 
        ...item, 
        id: item.id,
        cantidad: safeQty,
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

/**
 * Evenly distributes any remaining unselected pieces across available flavors.
 */
export function fillAssortedFlavors(itemId: string) {
    const item = cartItems.get()[itemId];
    if (!item || !item.saboresDisponibles || item.saboresDisponibles.length === 0) return;

    const currentSelection = { ...(item.seleccionSabores || {}) };
    const totalSelected = Object.values(currentSelection).reduce((a, b) => a + b, 0);
    const remaining = item.cantidad - totalSelected;
    if (remaining <= 0) return;

    const flavors = item.saboresDisponibles;
    for (let i = 0; i < remaining; i++) {
        const flavor = flavors[i % flavors.length];
        currentSelection[flavor] = (currentSelection[flavor] || 0) + 1;
    }

    cartItems.setKey(itemId, { ...item, seleccionSabores: currentSelection });
}

export function removeCartItem(key: string) {
    const current = cartItems.get();
    const { [key]: _, ...rest } = current;
    cartItems.set(rest);
}

export function clearCart() {
    cartItems.set({});
}

export function updateCartItemQuantity(key: string, quantity: number) {
    const item = cartItems.get()[key];
    const normalizedQty = Math.floor(quantity);
    if (isNaN(normalizedQty) || normalizedQty <= 0) {
        removeCartItem(key);
        return;
    }
    if (!item) return;

    const clampedQty = Math.min(MAX_ITEM_QUANTITY, normalizedQty);

    let updatedFlavors = item.seleccionSabores;
    if (updatedFlavors) {
        const totalSelected = Object.values(updatedFlavors).reduce((a, b) => a + b, 0);
        if (totalSelected > clampedQty) {
            let excess = totalSelected - clampedQty;
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
        cantidad: clampedQty,
        ...(updatedFlavors !== undefined ? { seleccionSabores: updatedFlavors } : {}),
    });
}

export const totalQuantity = computed(cartItems, items => {
    return Object.values(items).reduce((sum, item) => sum + item.cantidad, 0);
});

export const cartTotal = computed(cartItems, items => {
    return getCartTotal(Object.values(items));
});