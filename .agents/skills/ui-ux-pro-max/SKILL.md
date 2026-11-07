---
name: ui-ux-pro-max
description: "UI/UX design intelligence for web, mobile, and desktop (from nextlevelbuilder/ui-ux-pro-max-skill). Enforces SVG-only icons (no emojis), progressive disclosure, 4.5:1 contrast, 44x44px touch targets, and clean interactive hierarchy."
---

# UI/UX Pro Max — Core Rules & Pre-Delivery Checklist

## Priority Rules (1 → 9)

| Priority | Category            | Impact   | Must Have                                              | Anti-Patterns (Never Do)                                              |
| -------- | ------------------- | -------- | ------------------------------------------------------ | --------------------------------------------------------------------- |
| 1        | Accessibility       | CRITICAL | Contrast >= 4.5:1, Alt text, Keyboard nav, Aria-labels | Removing focus rings, Icon-only buttons without labels                |
| 2        | Touch & Interaction | CRITICAL | Min size 44×44px, 8px+ spacing, Loading feedback       | Reliance on hover only, Instant state changes (0ms)                   |
| 3        | Performance         | HIGH     | WebP/AVIF, Lazy loading, Reserve space (CLS < 0.1)     | Layout thrashing, Cumulative Layout Shift                             |
| 4        | Style & Icons       | HIGH     | Match product type, Consistency, **Crisp SVG icons**   | **Emoji as icons (🎨 🚀 📄 🔊)**, Mixing flat & skeuomorphic randomly |
| 5        | Layout & Responsive | HIGH     | Viewport-first studio layout, No horizontal scroll     | Pushing primary interactive canvas below the fold                     |
| 6        | Typography & Color  | MEDIUM   | Base 16px, Line-height 1.5, Semantic color tokens      | Text < 12px body, Gray-on-gray, Raw hex sprawl                        |
| 7        | Animation           | MEDIUM   | Context-aware timing, Motion conveys meaning           | Animating width/height, Ignoring `prefers-reduced-motion`             |
| 8        | Forms & Feedback    | MEDIUM   | Progressive disclosure, Clear inline feedback          | Overwhelming users upfront with walls of settings                     |
| 9        | Navigation Patterns | HIGH     | Predictable controls, Deep linking (`#/page/N`)        | Overloaded multi-step bureaucratic wizards for simple tools           |

## Icons & Visual Discipline

1. **No Emoji as Structural Icons**: Always use clean, consistent inline SVG vector icons (`stroke-width="1.75"`, `stroke-linecap="round"`, `stroke-linejoin="round"`, `aria-hidden="true"` when paired with text). Never use emojis (`📖`, `📄`, `🎨`, `🚀`, `🔊`, `📡`, `📥`) for navigation, toolbars, presets, or status badges.
2. **Progressive Disclosure**: Do not dump 6 sections of settings on screen at once or push the interactive preview below the fold. Keep the interactive product canvas front-and-center; tuck secondary settings (like TOC chapters or page reordering) into clean popovers/drawers or compact side panels.
3. **Honest, Actionable Copy**: Never show fake/placeholder URLs (`https://plif.app/...` or non-existent `manifest.json` URLs) that mislead users into thinking their local file is hosted in the cloud. Every action button must do exactly what it says immediately.
