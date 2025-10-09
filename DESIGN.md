# Design System

This document outlines the design system used in the Sablier Airdrops Sandbox.

## Color Palette

### Brand Colors

- **Sablier Orange**: `#f77423` - Primary brand color
  - Dark: `#e65a00`
  - Light: `#ff9654`

### Semantic Colors

#### Light Mode

- **Primary**: `#3b82f6` (blue-600)
- **Secondary**: `#64748b` (slate-500)
- **Success**: `#10b981` (green-500)
- **Warning**: `#f59e0b` (amber-500)
- **Error**: `#ef4444` (red-500)
- **Info**: `#3b82f6` (blue-500)

#### Dark Mode

- **Primary**: `#60a5fa` (blue-400)
- **Secondary**: `#94a3b8` (slate-400)
- **Success**: `#34d399` (green-400)
- **Warning**: `#fbbf24` (amber-400)
- **Error**: `#f87171` (red-400)
- **Info**: `#60a5fa` (blue-400)

## Typography

- **Sans Serif**: Geist Sans (via next/font)
- **Monospace**: Geist Mono (via next/font)

### Font Sizes

- **xs**: 0.75rem (12px)
- **sm**: 0.875rem (14px)
- **base**: 1rem (16px)
- **lg**: 1.125rem (18px)
- **xl**: 1.25rem (20px)
- **2xl**: 1.5rem (24px)
- **3xl**: 1.875rem (30px)
- **4xl**: 2.25rem (36px)
- **5xl**: 3rem (48px)

## Spacing

Uses Tailwind's default spacing scale (4px base unit).

## Border Radius

- **sm**: 0.25rem (4px)
- **base**: 0.5rem (8px)
- **lg**: 0.75rem (12px)
- **xl**: 1rem (16px)
- **full**: 9999px

## Shadows

- **Default**: `0 1px 3px 0 rgb(0 0 0 / 0.1)`
- **Large**: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

## Component Variants

### Buttons

- **Primary**: Blue background, white text
- **Secondary**: Gray background, dark text
- **Ghost**: Transparent background, border

Sizes: `sm`, `md`, `lg`

### Status States

- **Writing**: Yellow (wallet approval)
- **Confirming**: Blue (transaction pending)
- **Confirmed**: Green (success)
- **Error**: Red (failed)

## Usage

### CSS Variables

All colors are available as CSS variables:

```css
color: var(--sablier-orange);
background: var(--primary);
border-color: var(--border);
```

### Tailwind Classes

Use Tailwind's design tokens:

```tsx
<div className="bg-blue-600 text-white rounded-lg shadow-lg">
  <h2 className="text-2xl font-bold">Title</h2>
</div>
```

### Custom Classes

Brand-specific utility classes:

```tsx
<div className="text-sablier">Sablier Orange Text</div>
<button className="bg-sablier">Sablier Orange Button</button>
```

## Customization

All design tokens are marked with `/* CUSTOMIZATION POINT */` comments in `app/globals.css`.

To customize:

1. Update CSS variables in `:root` and `.dark`
2. Modify color values to match your brand
3. Update component variants as needed

## Accessibility

- All colors meet WCAG AA contrast requirements
- Interactive elements have `:hover` and `:focus` states
- Semantic HTML used throughout
