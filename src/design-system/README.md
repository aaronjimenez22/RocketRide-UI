# RocketRide Design System

This folder is the reusable UI kit that mirrors production styling. Treat it as the
source of truth for tokens, base styles, components, and reusable patterns.

## Usage
- Import the design system once in your app entry:
  - `src/design-system/index.css`
- Compose UI using the class names defined here.

## File Layout
- `tokens.css` — color, type, spacing, radius, motion
- `base.css` — resets + global defaults
- `typography.css` — titles, body, labels
- `layout.css` — stack, row, container, surface, divider
- `components.css` — buttons, inputs, cards, tabs, tables, etc.
- `shell.css` — app shell layout (`rr-app`, `rr-main`, `rr-page`)
- `sidebar.css` — sidebar navigation + icon primitives
- `projects.css` — project list pattern styles
- `flow.css` — React Flow custom node + edge styles
- `catalog.css` — design system catalog page styles

## How to Add New Patterns
1. Add the markup to a reference page in `src/pages/`.
2. Extract the styling into a new module (or extend an existing one) inside
   `src/design-system/`.
3. Keep class names stable so devs can reuse them without digging.
