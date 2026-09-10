import { create } from 'zustand';
import toast from 'react-hot-toast';

function computeTotals(items) {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.quantity) || 1),
    0
  );
  const tax = parseFloat((subtotal * 0.08).toFixed(2));
  const shipping = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 9.99;
  const total = parseFloat((subtotal + tax + shipping).toFixed(2));
  const itemCount = items.reduce((sum, i) => sum + (Number(i.quantity) || 1), 0);
  return { subtotal, tax, shipping, total, itemCount };
}

export const useCartStore = create((set, get) => ({
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  itemCount: 0,
  isOpen: false,

  // ── Toggle cart panel ──────────────────────────────────────────────────
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // ── Add item ──────────────────────────────────────────────────────────
  addItem: (productOrItem, quantity = 1) => {
    if (!productOrItem) return;
    const product = productOrItem.product || productOrItem;
    const qty = Number(quantity || productOrItem.quantity || 1);
    const id = product.id || product.productId;
    if (!id) return;

    // Resolve price robustly (can be number, string, Decimal)
    const rawPrice = product.price ?? productOrItem.price ?? 0;
    const price = typeof rawPrice === 'number' ? rawPrice : (parseFloat(rawPrice) || 0);

    // Resolve image URL robustly
    let image = null;
    if (typeof product.image === 'string' && product.image) {
      image = product.image;
    } else if (product.image?.url) {
      image = product.image.url;
    } else if (Array.isArray(product.images) && product.images.length > 0) {
      image = typeof product.images[0] === 'string' ? product.images[0] : (product.images[0]?.url || null);
    } else if (typeof productOrItem.image === 'string' && productOrItem.image) {
      image = productOrItem.image;
    }

    const { items } = get();
    const existing = items.find((i) => i.productId === id);

    let newItems;
    if (existing) {
      newItems = items.map((i) =>
        i.productId === id ? { ...i, quantity: i.quantity + qty } : i
      );
      toast.success(`Updated quantity for ${product.name || 'product'}`);
    } else {
      newItems = [
        ...items,
        {
          productId: id,
          name: product.name || 'Product',
          price,
          image,
          slug: product.slug || id,
          stock: product.stock ?? 99,
          quantity: qty,
        },
      ];
      toast.success(`${product.name || 'Product'} added to cart`);
    }

    set({ items: newItems, ...computeTotals(newItems) });
  },

  addToCart: (product, quantity = 1) => get().addItem(product, quantity),

  // ── Remove item ───────────────────────────────────────────────────────
  removeItem: (productId) => {
    const newItems = get().items.filter((i) => i.productId !== productId);
    set({ items: newItems, ...computeTotals(newItems) });
    toast.success('Item removed from cart');
  },

  // ── Update quantity ───────────────────────────────────────────────────
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    const newItems = get().items.map((i) =>
      i.productId === productId ? { ...i, quantity } : i
    );
    set({ items: newItems, ...computeTotals(newItems) });
  },

  // ── Clear cart ────────────────────────────────────────────────────────
  clearCart: () =>
    set({
      items: [],
      subtotal: 0,
      tax: 0,
      shipping: 0,
      total: 0,
      itemCount: 0,
      isOpen: false,
    }),

  // ── Helper getters ────────────────────────────────────────────────────
  getSubtotal: () => get().subtotal,
  getTax: () => get().tax,
  getShipping: () => get().shipping,
  getTotal: () => get().total,
  getItemCount: () => get().itemCount,
  getTotalItems: () => get().itemCount,
}));
