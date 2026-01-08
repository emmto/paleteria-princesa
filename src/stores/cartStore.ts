import { map, computed } from 'nanostores';
import type { CartItem, Precios } from '../utils/cartLogic';

export type CartItemInput = Omit<CartItem, 'precios'> & { precios: Precios };

// Key is a unique string combination of ID + Flavor (if any)
export const cartItems = map<Record<string, CartItem>>({});

export const isCartOpen = map<boolean>(false);

export function addCartItem(item: CartItemInput) {
  const existingItems = cartItems.get();
  const key = item.sabor ? `${item.id}-${item.sabor}` : item.id;

  if (existingItems[key]) {
    cartItems.setKey(key, {
        ...existingItems[key],
        cantidad: existingItems[key].cantidad + item.cantidad
    });
  } else {
    cartItems.setKey(key, { ...item, id: item.id }); // Ensure structure matches
  }
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
