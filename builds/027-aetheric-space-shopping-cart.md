# Build 27: Aetheric Space Shopping Cart

Premium React and Zustand shopping cart with a product catalog, cart drawer, promo codes, free-shipping calculation, and a validation-backed checkout flow.

## Snapshot
- Date Pushed: 2026-07-07
- Technology: Zustand
- Category: Web Frontend
- Depth: Deep
- Repo: https://github.com/breakingthebot/react-zustand-shopping-cart

## Notes
Zustand store with persist/partialize middleware so only real cart items survive a refresh, not transient UI state. Promo code system (percentage, flat, and free-shipping codes) with derived pricing getters so tax/shipping/discount math lives in one place. Toast notifications replaced a forced cart-drawer-open UX. Vitest + React Testing Library coverage across cartStore and toastStore.
