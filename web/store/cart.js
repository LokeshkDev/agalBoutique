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

// Cross-tab real-time synchronization
if (typeof window !== "undefined") {
  let isSyncing = false;
  let broadcastChannel = null;

  try {
    if (typeof window.BroadcastChannel !== "undefined") {
      broadcastChannel = new BroadcastChannel("ab-cart-sync");
      broadcastChannel.onmessage = (event) => {
        if (
          event.data?.type === "CART_SYNC" &&
          Array.isArray(event.data?.items)
        ) {
          const currentItems = useCart.getState().items;
          if (JSON.stringify(currentItems) !== JSON.stringify(event.data.items)) {
            isSyncing = true;
            useCart.setState({ items: event.data.items });
            isSyncing = false;
          }
        }
      };
    }
  } catch (e) {
    // BroadcastChannel unsupported or blocked in environment
  }

  // 1. Storage Event Listener (fires on other tabs when localStorage changes)
  window.addEventListener("storage", (event) => {
    if (event.key === "ab-cart") {
      try {
        if (!event.newValue) {
          const current = useCart.getState().items;
          if (current && current.length > 0) {
            isSyncing = true;
            useCart.setState({ items: [] });
            isSyncing = false;
          }
          return;
        }
        const parsed = JSON.parse(event.newValue);
        const storedItems = parsed?.state?.items;
        if (Array.isArray(storedItems)) {
          const currentItems = useCart.getState().items;
          if (JSON.stringify(currentItems) !== JSON.stringify(storedItems)) {
            isSyncing = true;
            useCart.setState({ items: storedItems });
            isSyncing = false;
          }
        } else {
          useCart.persist?.rehydrate?.();
        }
      } catch (err) {
        useCart.persist?.rehydrate?.();
      }
    }
  });

  // 2. Broadcast when local tab changes items
  if (broadcastChannel) {
    let prevItemsJson = JSON.stringify(useCart.getState().items);
    useCart.subscribe((state) => {
      if (isSyncing) return;
      const nextItemsJson = JSON.stringify(state.items);
      if (nextItemsJson !== prevItemsJson) {
        prevItemsJson = nextItemsJson;
        try {
          broadcastChannel.postMessage({
            type: "CART_SYNC",
            items: state.items,
          });
        } catch (e) {
          // ignore
        }
      }
    });
  }

  // 3. Tab visibility / focus re-sync (for tabs backgrounded or resuming)
  const syncFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem("ab-cart");
      if (!raw) {
        if (useCart.getState().items.length > 0) {
          isSyncing = true;
          useCart.setState({ items: [] });
          isSyncing = false;
        }
        return;
      }
      const parsed = JSON.parse(raw);
      const storedItems = parsed?.state?.items;
      if (Array.isArray(storedItems)) {
        const currentItems = useCart.getState().items;
        if (JSON.stringify(currentItems) !== JSON.stringify(storedItems)) {
          isSyncing = true;
          useCart.setState({ items: storedItems });
          isSyncing = false;
        }
      }
    } catch (e) {
      // ignore
    }
  };

  window.addEventListener("focus", syncFromLocalStorage);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      syncFromLocalStorage();
    }
  });
}

