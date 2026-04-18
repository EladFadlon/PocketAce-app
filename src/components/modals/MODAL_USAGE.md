# Modal System Usage Guide

## Overview

The PocketAce modal system provides a centralized way to manage all application modals. The `ModalManager` component handles displaying modals globally, and the `showModal` function can be called from anywhere in the application to trigger modals.

## Setup

1. Add the `ModalManager` to your root `App` component:

```tsx
import { ModalManager } from './components/modals';

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      <ModalManager />
    </div>
  );
}
```

## Usage

### Showing a Modal

Import the `showModal` function and call it with the modal type and optional data:

```tsx
import { showModal } from './components/modals';

// Show welcome gift modal
showModal({ 
  type: 'welcomeGift', 
  data: { credits: 50 } 
});

// Show credit confirmation modal
showModal({
  type: 'creditConfirmation',
  data: {
    creditsRemaining: 3,
    onConfirm: () => console.log('Game started!')
  }
});

// Show store modal
showModal({
  type: 'store',
  data: {
    onPurchase: (credits) => console.log(`Purchased ${credits} credits`)
  }
});

// Show game over modal
showModal({
  type: 'gameOver',
  data: {
    onShop: () => console.log('Going to shop')
  }
});
```

## Modal Types

### 1. Welcome Gift Modal
Displays a welcome gift offer to new users.

**Props:**
```tsx
data?: {
  credits?: number;  // Number of credits gifted (default: 50)
}
```

**Example:**
```tsx
showModal({
  type: 'welcomeGift',
  data: { credits: 50 }
});
```

### 2. Credit Confirmation Modal
Confirms that the user wants to spend a credit to start a game.

**Props:**
```tsx
data?: {
  creditsRemaining?: number;  // Total credits the user has
  onConfirm?: () => void;     // Callback when user confirms
}
```

**Example:**
```tsx
showModal({
  type: 'creditConfirmation',
  data: {
    creditsRemaining: 5,
    onConfirm: () => startGame()
  }
});
```

### 3. Store Modal
Displays credit packages for purchase.

**Props:**
```tsx
data?: {
  packages?: CreditPackage[];  // Array of credit packages
  onPurchase?: (credits: number) => void;  // Callback on successful purchase
}
```

**Example:**
```tsx
showModal({
  type: 'store',
  data: {
    onPurchase: (credits) => {
      updateUserCredits(credits);
    }
  }
});
```

### 4. Game Over Modal
Displays when the user runs out of credits.

**Props:**
```tsx
data?: {
  onShop?: () => void;  // Callback when user clicks "Buy Credits Now"
}
```

**Example:**
```tsx
showModal({
  type: 'gameOver',
  data: {
    onShop: () => showModal({ type: 'store' })
  }
});
```

## Closing Modals

Modals close automatically when:
- The user clicks the close button (✕)
- The user clicks on the overlay (outside the modal content)
- The modal's action completes (e.g., purchase succeeds, button is clicked)

## Styling

All modals use the `modals.css` file which includes:
- Modal overlays with blur effect
- Responsive grid layouts
- Golden and green color schemes
- Smooth animations with framer-motion

### CSS Classes

- `.modal-overlay` - The semi-transparent background
- `.modal-content` - The modal content container
- `.modal-title` - Modal heading
- `.modal-btn` - Button styling (primary/secondary)
- `.modal-buttons` - Button container

## Best Practices

1. **Always provide data callbacks** - When a modal needs to trigger app state changes (like updating credits), pass the callback via the `data` object.

2. **Chain modals** - You can trigger one modal from another:
```tsx
showModal({
  type: 'gameOver',
  data: {
    onShop: () => showModal({ type: 'store' })
  }
});
```

3. **Handle async operations** - The store modal handles simulated purchases internally. Make sure your callbacks are synchronous or return promises.

4. **Test modals independently** - Each modal can be tested in isolation since they're functional components.

## Animation Details

- Welcome Gift: Scale + rotate entrance with spring physics
- Credit Confirmation: Smooth scale entrance
- Store: Staggered package card animations
- Game Over: Urgent scale entrance

All animations use `framer-motion` for smooth, performant effects.

## Accessibility

- All modals have close buttons (✕)
- Click outside to close (click handler on overlay)
- Keyboard support (ESC will close - standard browser behavior)
- Color contrast meets accessibility standards

## Important Notes

- Only one modal can be displayed at a time
- Modals are positioned fixed with z-index: 9999
- The modal overlay prevents interaction with background content
- All modals automatically handle their own state management
