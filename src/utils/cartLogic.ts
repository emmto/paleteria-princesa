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
  saboresDisponibles?: string[];
  seleccionSabores?: Record<string, number>;
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
  const phoneNumber = '520000000';
  let message = 'Hola, me gustaría hacer un pedido:\n\n';
  
  items.forEach(item => {
    if (item.seleccionSabores && Object.keys(item.seleccionSabores).length > 0) {
      message += `- ${item.cantidad}x ${item.nombre}:\n`;
      Object.entries(item.seleccionSabores).forEach(([sabor, qty]) => {
        if (qty > 0) message += `  • ${qty}x ${sabor}\n`;
      });
      // Check if there are unselected items
      const selectedCount = Object.values(item.seleccionSabores).reduce((a, b) => a + b, 0);
      if (selectedCount < item.cantidad) {
         message += `  • ${item.cantidad - selectedCount}x Sin sabor específico\n`;
      }
    } else {
      const saborStr = item.sabor ? ` (${item.sabor})` : '';
      message += `- ${item.cantidad}x ${item.nombre}${saborStr}\n`;
    }
  });

  message += `\nTotal estimado: $${total.toFixed(2)}`;
  
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
};
