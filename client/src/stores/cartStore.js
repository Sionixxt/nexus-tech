import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useCartStore = create((set, get) => ({
  items: [],
  isOpen: false, // For slide-over cart panel

  // ── Toggle cart panel ──────────────────────────────────────────────────
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  // ── Add item ──────────────────────────────────────────────────────────
  addItem: (product, quantity = 1) => {
    const { items } = get();
    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      set({
        items: items.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        ),
      });
      toast.success(`Updated quantity for ${product.name}`);
    } else {
      set({
        items: [
          ...items,
          {
            productId: product.id,
            name: product.name,
            price: parseFloat(product.price),
            image: product.images?.[0]?.url || null,
            slug: product.slug,
            stock: product.stock,
            quantity,
          },
        ],
      });
      toast.success(`${product.name} added to cart`);
    }
  },
  addToCart: (product, quantity = 1) => get().addItem(product, quantity),

  // ── Remove item ───────────────────────────────────────────────────────
  removeItem: (productId) => {
    set({ items: get().items.filter((i) => i.productId !== productId) });
    toast.success('Item removed from cart');
  },

  // ── Update quantity ───────────────────────────────────────────────────
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      ),
    });
  },

  // ── Clear cart ────────────────────────────────────────────────────────
  clearCart: () => set({ items: [], isOpen: false }),

  // ── Computed values ───────────────────────────────────────────────────
  get itemCount() {
    return get().items.reduce((sum, i) => sum + i.quantity, 0);
  },

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

  getTax: () => parseFloat((get().getSubtotal() * 0.08).toFixed(2)),

  getShipping: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0) return 0;
    return subtotal >= 500 ? 0 : 9.99;
  },

  getTotal: () => {
    const sub = get().getSubtotal();
    return parseFloat((sub + get().getTax() + get().getShipping()).toFixed(2));
  },

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),

  getTotalItems: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
