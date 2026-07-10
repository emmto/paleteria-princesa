import { map, computed } from 'nanostores';
import type { CartItem, Precios } from '../utils/cartLogic';

export type CartItemInput = Omit<CartItem, 'precios'> & { precios: Precios };

// Key is the product ID
export const cartItems = map<Record<string, CartItem>>({});

export const isCartOpen = map<boolean>(false);

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
    if (item) {
        cartItems.setKey(key, { ...item, cantidad: quantity });
    }
}

export const totalQuantity = computed(cartItems, items => {
    return Object.values(items).reduce((sum, item) => sum + item.cantidad, 0);
});