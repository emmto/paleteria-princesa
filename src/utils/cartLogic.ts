export type PriceTier = 'menudeo' | 'medio' | 'mayoreo';

export interface Precios {
  menudeo: number;
  medio: number;
  mayoreo: number;
}

export interface CartItem {
  id: string;
  nombre: string;
  cantidad: number;
  sabor?: string;
  precios: Precios;
}

export const getPrecioUnitario = (cantidadTotal: number, precios: Precios): number => {
  if (cantidadTotal >= 50) return precios.mayoreo;
  if (cantidadTotal >= 30) return precios.medio;
  return precios.menudeo;
};

export const getPriceTier = (cantidadTotal: number): PriceTier => {
    if (cantidadTotal >= 50) return 'mayoreo';
    if (cantidadTotal >= 30) return 'medio';
    return 'menudeo';
}

export const generateWhatsAppLink = (items: CartItem[], total: number): string => {
  const phoneNumber = '523111430040';
  let message = 'Hola, me gustaría hacer un pedido:\n\n';
  
  items.forEach(item => {
    const saborStr = item.sabor ? ` (${item.sabor})` : '';
    message += `- ${item.cantidad}x ${item.nombre}${saborStr}\n`;
  });

  message += `\nTotal estimado: $${total.toFixed(2)}`;
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
