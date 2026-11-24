export type PriceTier = 'menudeo' | 'medio' | 'mayoreo';

export const WHATSAPP_PHONE = '520000000';

export interface Precios {
  menudeo: number;
  medio: number;
  mayoreo: number;
}

export interface CartItem {
  id: string;
  nombre: string;
  cantidad: number;
  imagen?: string;
  sabor?: string;
  precios: Precios;
  saboresDisponibles?: string[];
  seleccionSabores?: Record<string, number>;
}

export interface ItemTierProgress {
  tier: PriceTier;
  tierLabel: string;
  unitPrice: number;
  subtotal: number;
  nextTierLabel: string | null;
  missingForNext: number;
  nextUnitPrice: number | null;
  progressPercent: number;
}

/**
 * Computes unit price based on an individual product's quantity.
 */
export const getPrecioUnitario = (cantidadProducto: number, precios: Precios): number => {
  if (cantidadProducto >= 50) return precios.mayoreo;
  if (cantidadProducto >= 30) return precios.medio;
  return precios.menudeo;
};

/**
 * Computes price tier based on an individual product's quantity.
 */
export const getPriceTier = (cantidadProducto: number): PriceTier => {
  if (cantidadProducto >= 50) return 'mayoreo';
  if (cantidadProducto >= 30) return 'medio';
  return 'menudeo';
};

export const getTierLabel = (tier: PriceTier): string => {
  switch (tier) {
    case 'mayoreo':
      return 'Mayoreo';
    case 'medio':
      return 'Medio Mayoreo';
    default:
      return 'Menudeo';
  }
};

export const formatCurrency = (amount: number): string => `$${amount.toFixed(2)}`;

export const formatCardPrice = (amount: number): string =>
  Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`;

export const getItemSubtotal = (item: CartItem): number =>
  getPrecioUnitario(item.cantidad, item.precios) * item.cantidad;

export const getCartTotal = (items: CartItem[]): number =>
  items.reduce((sum, item) => sum + getItemSubtotal(item), 0);

export const getItemTierProgress = (item: CartItem): ItemTierProgress => {
  const tier = getPriceTier(item.cantidad);
  const tierLabel = getTierLabel(tier);
  const unitPrice = getPrecioUnitario(item.cantidad, item.precios);
  const subtotal = unitPrice * item.cantidad;

  if (item.cantidad < 30) {
    return {
      tier,
      tierLabel,
      unitPrice,
      subtotal,
      nextTierLabel: 'Medio Mayoreo',
      missingForNext: 30 - item.cantidad,
      nextUnitPrice: item.precios.medio,
      progressPercent: (item.cantidad / 30) * 100,
    };
  }

  if (item.cantidad < 50) {
    return {
      tier,
      tierLabel,
      unitPrice,
      subtotal,
      nextTierLabel: 'Mayoreo',
      missingForNext: 50 - item.cantidad,
      nextUnitPrice: item.precios.mayoreo,
      progressPercent: ((item.cantidad - 30) / 20) * 100,
    };
  }

  return {
    tier,
    tierLabel,
    unitPrice,
    subtotal,
    nextTierLabel: null,
    missingForNext: 0,
    nextUnitPrice: null,
    progressPercent: 100,
  };
};

export const generateDirectWhatsAppLink = (message: string): string =>
  `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

export const generateWhatsAppLink = (items: CartItem[], total?: number): string => {
  const computedTotal = typeof total === 'number' ? total : getCartTotal(items);
  const totalPieces = items.reduce((sum, item) => sum + item.cantidad, 0);
  let message = 'Hola, me gustaría hacer un pedido:\n\n';

  items.forEach(item => {
    const tier = getPriceTier(item.cantidad);
    const tierLabel = getTierLabel(tier);
    const unitPrice = getPrecioUnitario(item.cantidad, item.precios);
    const subtotal = unitPrice * item.cantidad;
    const priceSummary = `(${tierLabel} · $${unitPrice.toFixed(2)} c/u = $${subtotal.toFixed(2)})`;

    if (item.seleccionSabores && Object.keys(item.seleccionSabores).length > 0) {
      message += `- ${item.cantidad}x ${item.nombre} ${priceSummary}:\n`;
      Object.entries(item.seleccionSabores).forEach(([sabor, qty]) => {
        if (qty > 0) message += `  • ${qty}x ${sabor}\n`;
      });
      const selectedCount = Object.values(item.seleccionSabores).reduce((a, b) => a + b, 0);
      if (selectedCount < item.cantidad) {
        message += `  • ${item.cantidad - selectedCount}x Surtido\n`;
      }
    } else if (item.saboresDisponibles && item.saboresDisponibles.length > 0) {
      message += `- ${item.cantidad}x ${item.nombre} ${priceSummary}:\n`;
      message += `  • ${item.cantidad}x Surtido\n`;
    } else {
      const saborStr = item.sabor ? ` (${item.sabor})` : '';
      message += `- ${item.cantidad}x ${item.nombre}${saborStr} ${priceSummary}\n`;
    }
  });

  message += `\nTotal de piezas: ${totalPieces} pz\nTotal estimado: $${computedTotal.toFixed(2)}`;

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};
