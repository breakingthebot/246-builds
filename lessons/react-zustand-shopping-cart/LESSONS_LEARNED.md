# Lessons Learned — Aetheric Space Shopping Cart (React + Zustand)
**Build #27 | Zustand | Web Frontend | 2026-07-07**

---

## What Worked Well

- **Zustand for state management**: Zustand's minimal API (`create()` with a state object + actions) was the right scale for a shopping cart — more structure than `useState` without the boilerplate of Redux. The `useCartStore` hook made store access ergonomic from any component.
- **`persist/partialize` middleware**: Zustand's `persist` middleware with a `partialize` function that filtered out transient UI state (e.g., `isDrawerOpen`) meant only the real cart items survived a page refresh. Without `partialize`, a reopened browser would show the cart drawer open — a subtle but real UX bug.
- **Derived pricing getters**: Computing `subtotal`, `discount`, `tax`, `shipping`, and `total` as getter functions on the store (not stored values) meant the math always stayed in sync. No "stale total" bugs.
- **Promo code system**: Three promo code types — percentage (`SAVE10`: 10% off), flat (`SAVE5`: $5 off), and free shipping (`FREESHIP`) — with a `validatePromoCode` action that returned a typed result (`valid`, `invalid`, `already_applied`) drove clean error messaging.
- **Toast notifications**: Replacing a forced cart-drawer-open on "add to cart" with a toast notification was a UX win — users could continue browsing without being redirected to the cart.
- **Vitest + React Testing Library**: Testing `cartStore` and `toastStore` with Vitest (same config as Vite, much faster than Jest for Vite projects) produced a reliable test suite with minimal setup.

## Challenges Overcome

- **Zustand store hydration timing**: On initial render, the persisted store is not yet hydrated from `localStorage`. Using Zustand's `onRehydrateStorage` callback and a `hasHydrated` flag prevented a flash of empty cart state on page load.
- **Cart quantity edge cases**: What happens when a user adds an item that's already in the cart? Increment the quantity. What if quantity goes to 0? Remove the item. What if stock limit is reached? Show an error toast and cap the quantity. Each case needed explicit handling.
- **Promo code validation UX**: The "apply promo" flow had to handle: valid code, invalid code, already-applied code, and code that makes the total negative (minimum order enforcement). All four cases needed distinct user-facing messages.
- **Checkout form validation**: The multi-step checkout (shipping → payment → review) needed field-level validation that ran on blur (not on every keystroke) and a summary validation on submit. Used a custom `useFormValidation` hook rather than a library.

## Key Insights

- `partialize` in Zustand's persist middleware is not optional for any store that has transient UI state. Always define what should and shouldn't survive a refresh.
- Derived values in the store (computed from state) are strictly better than stored derived values. The latter go stale; the former are always correct.
- Toast notifications are almost always better than modal interruptions for non-critical feedback (item added, promo code applied, etc.).

## Next Time

- Add a product detail page with a zoom gallery and related products.
- Implement a wishlist (saved for later) feature using the same Zustand persist pattern.
- Add Stripe (or a Stripe-like mock) for the actual payment step.
- Add React Query for the product catalog fetching so out-of-stock status stays current.

## Skills Gained

- Zustand: `create`, `persist`, `partialize`, store hydration, devtools middleware
- React patterns: compound components, controlled forms, custom hooks
- Vitest + React Testing Library: store testing, component rendering, user interaction simulation
- Promo code discount calculation patterns
- Multi-step form validation architecture

## Integration Points

- The Zustand `persist/partialize` pattern is the natural evolution of the `localStorage` state management in **Kanban Board (Build #9)** and **Typed Task Manager (Build #10)**.
- React Query was added as the data fetching layer in the immediately following **GitHub Dashboard (Build #28)** — a direct progression.
- The toast notification system (store-based, not component-local) is a reusable pattern for any React app.
