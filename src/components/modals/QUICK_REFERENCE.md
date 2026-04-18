# Modal System - Quick Reference

## 1-Minute Setup

### Add to App.tsx
```tsx
import { ModalManager } from './components/modals';

function App() {
  return (
    <>
      {/* your content */}
      <ModalManager />
    </>
  );
}
```

## Common Usage Patterns

### Welcome New Users
```tsx
import { showModal } from './components/modals';

showModal({ 
  type: 'welcomeGift', 
  data: { credits: 3 } 
});
```

### Confirm Game Start
```tsx
showModal({
  type: 'creditConfirmation',
  data: {
    creditsRemaining: currentUser.credits,
    onConfirm: () => {
      startGame();
      updateCredits(currentUser.credits - 1);
    }
  }
});
```

### Open Credit Store
```tsx
showModal({
  type: 'store',
  data: {
    onPurchase: (credits) => {
      updateUserCredits(user.id, user.credits + credits);
    }
  }
});
```

### Show Out of Credits
```tsx
showModal({
  type: 'gameOver',
  data: {
    onShop: () => {
      showModal({ type: 'store' });
    }
  }
});
```

## TypeScript Interfaces

```tsx
interface ModalState {
  type: 'welcomeGift' | 'creditConfirmation' | 'store' | 'gameOver' | null;
  data?: any;
}
```

## Modal Lifecycle

1. Call `showModal()` with type and data
2. Modal renders inside `ModalManager`
3. User interacts (clicks button, closes)
4. Modal calls callback (if provided) then closes
5. `ModalManager` state resets to `null`

## Chaining Modals

```tsx
// From GameOver, open Store
showModal({
  type: 'gameOver',
  data: {
    onShop: () => showModal({ type: 'store' })
  }
});

// From Store success, show GameOver
then(() => {
  showModal({ type: 'gameOver' });
});
```

## Props by Modal Type

### `welcomeGift`
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| credits | number | 50 | Amount of credits to gift |

### `creditConfirmation`
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| creditsRemaining | number | 1 | Current user credits |
| onConfirm | () => void | () => {} | Confirm callback |

### `store`
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| packages | CreditPackage[] | Default packages | Credit packages to display |
| onPurchase | (credits: number) => void | () => {} | Purchase callback |

### `gameOver`
| Key | Type | Default | Description |
|-----|------|---------|-------------|
| onShop | () => void | () => {} | Shop button callback |

## CSS Classes for Styling

```css
/* Container */
.modal-overlay          /* Background overlay */
.modal-content          /* Modal box */

/* Specific modals */
.welcome-gift-modal
.credit-confirmation-modal
.store-modal
.game-over-modal

/* Elements */
.modal-title            /* Heading */
.modal-btn              /* Buttons */
.modal-btn.primary      /* Primary button */
.modal-btn.secondary    /* Secondary button */
.modal-buttons          /* Button group */
```

## Colors

| Token | Value | Usage |
|-------|-------|-------|
| Gold | `#d4af37` | Primary action, titles |
| Light Gold | `#f4d03f` | Highlights |
| Green | `#3cb371` | Success, positive |
| Red | `#ef4444` | Danger, critical |
| Text | `#f5f5f7` | Main text |
| Muted | `#a1a1a6` | Secondary text |

## Animation Durations

- Entrance: 300ms
- Content reveal: 0.2s - 0.9s (staggered)
- Hover: 200ms
- Success: 600ms

## Visual Examples

### Modal States
```
Initial → Animated In → User Interacts → Close Animation → Hidden
```

### Package Card States
```
Default → Hover (scale up) → Purchasing (disabled) → Success
```

## Common Errors & Fixes

**Modal not showing?**
```tsx
// ❌ Wrong
import WelcomeGiftModal from './components/modals/WelcomeGiftModal';
<WelcomeGiftModal isOpen={true} />

// ✅ Right
import { showModal } from './components/modals';
showModal({ type: 'welcomeGift' });
```

**Data not passing?**
```tsx
// ❌ Wrong
showModal({ type: 'store' });

// ✅ Right
showModal({ 
  type: 'store',
  data: { 
    onPurchase: (credits) => updateUser(credits) 
  }
});
```

**Callback not firing?**
```tsx
// ❌ Wrong - missing data object
showModal({ type: 'gameOver' });

// ✅ Right - pass data with callback
showModal({
  type: 'gameOver',
  data: { onShop: () => console.log('shop') }
});
```

## File Locations

```
modals/
├── ModalManager.tsx              (orchestrator)
├── {Modal}Modal.tsx              (4 modals)
├── modals.css                    (styling)
├── index.ts                      (exports)
├── MODAL_USAGE.md               (detailed guide)
├── IMPLEMENTATION.md            (architecture)
└── QUICK_REFERENCE.md           (this file)
```

## Importing

```tsx
// Individual components
import WelcomeGiftModal from './components/modals/WelcomeGiftModal';

// ModalManager + showModal
import { ModalManager, showModal } from './components/modals';

// All exports
import { 
  ModalManager, 
  showModal,
  WelcomeGiftModal,
  CreditConfirmationModal,
  StoreModal,
  GameOverModal
} from './components/modals';
```

## Performance Tips

1. Always pass callbacks (don't trigger state from outside)
2. Use `useCallback` for modal callbacks to prevent re-renders
3. Let modal handle its own async operations
4. Only show one modal at a time

## Browser Support

- Chrome/Edge 90+
- Safari 15+
- Firefox 88+

## Need Help?

- See `MODAL_USAGE.md` for detailed examples
- See `IMPLEMENTATION.md` for architecture
- Check `modals.css` for styling customization
- Review existing modal components for patterns
