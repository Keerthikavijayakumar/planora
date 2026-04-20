# Planora Sakura Theme Design Guide 🌸

This document outlines the design system and aesthetic principles behind the **Sakura Theme**, a premium, high-tech, and vibrant visual identity for the Planora project architecture platform.

## 🎨 Color Palette

The theme is built on a sophisticated palette of pinks, deep reds, and soft mist colors, designed to feel both premium and inviting.

| Variable | HEX | Usage |
| :--- | :--- | :--- |
| `--sakura-petal` | `#F4A7B9` | Primary accents, progress bars, active states. |
| `--sakura-deep` | `#C0576B` | Brand identity, primary buttons, bold text. |
| `--sakura-blush` | `#FDE8EE` | Light backgrounds, secondary buttons. |
| `--sakura-mist` | `#FFF5F8` | Page body background, soft containers. |
| `--sakura-bark` | `#3D1A24` | Primary text, deep dark accents. |
| `--sakura-bark-soft` | `#6B3545` | Secondary text, subheaders. |

## 🧬 Design Principles

### 1. Glassmorphism
Planora uses advanced glassmorphism to create depth and a modern "high-tech" feel.
- **Glass Card**: `background: rgba(255, 255, 255, 0.75); backdrop-filter: blur(24px);`
- **Sakura Card**: A tinted glass variant with a pinkish gradient.
- **Borders**: Subtle, semi-transparent pink borders (`var(--glass-border)`) are essential.

### 2. Typography
A harmonic pairing of serif and sans-serif fonts:
- **Display**: `Cormorant Garamond` — Used for headlines and hero statements to provide an elegant, academic, and premium look.
- **Sans**: `Outfit` — Used for UI elements, labels, and paragraph body for high readability.
- **Mono**: `JetBrains Mono` — Used for code snippets and technical data.

### 3. Dynamic Motion
Motion is a core part of the Planora experience:
- **Floating Petals**: Interactive background particles (`PetalBackground` component) that drift across the screen.
- **Scroll Parallax**: Smooth mapping of scroll progress to UI transitions (horizontal features, hero text).
- **Scale Springs**: Micro-interactions on buttons and icons using `framer-motion`.

## 🏗️ Reusable Components (CSS Classes)

| Class | Description |
| :--- | :--- |
| `.btn-primary` | Premium gradient button with shadow and lift effect. |
| `.btn-secondary` | Subtle glass-styled button for secondary actions. |
| `.input-field` | Highly legible, themed inputs with custom focus states. |
| `.sakura-badge` | Pill-shaped badges for tags and statuses. |
| `.animate-fadeInUp` | Standard entry animation for page elements. |

## 🛠️ Usage Example (Framer Motion)

```jsx
import { motion } from 'framer-motion';

const PremiumComponent = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
    className="sakura-card"
  >
    <h2 className="heading-serif">Architecting Vision</h2>
    <button className="btn-primary">Generate Now</button>
  </motion.div>
);
```

---

*“Precision meets elegance.” — The Planora Team*
