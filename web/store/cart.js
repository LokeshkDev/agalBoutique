"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      open: false,

      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),

      add: (item) =>
        set((s) => {
          const itemQty = item.qty || item.quantity || 1;
          const existing = s.items.find(
            (x) =>
              x.id === item.id &&
              x.size === item.size &&
              (item.color ? x.color === item.color : true)
          );
          const items = existing
            ? s.items.map((x) =>
                x === existing ? { ...x, qty: (x.qty || 1) + itemQty } : x
              )
            : [...s.items, { ...item, qty: itemQty }];
          return { items, open: true };
        }),

      setQty: (id, size, qty, color) =>
        set((s) => ({
          items: s.items
            .map((x) =>
              x.id === id &&
              x.size === size &&
              (color === undefined || x.color === color)
                ? { ...x, qty }
                : x
            )
            .filter((x) => x.qty > 0),
        })),

      remove: (id, size, color) =>
        set((s) => ({
          items: s.items.filter(
            (x) =>
              !(
                x.id === id &&
                x.size === size &&
                (color === undefined || x.color === color)
              )
          ),
        })),

      clear: () => set({ items: [] }),

      get count() {
        return get().items.reduce((t, x) => t + (x.qty || 1), 0);
      },

      subtotal: () =>
        get().items.reduce((t, x) => t + x.price * (x.qty || 1), 0),

      savings: () =>
        get().items.reduce(
          (t, x) => t + (x.mrp ? (x.mrp - x.price) * (x.qty || 1) : 0),
          0
        ),
    }),
    {
      name: "ab-cart",
      partialize: (state) => ({ items: state.items }),
    }
  )
);

