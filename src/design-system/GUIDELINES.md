# RocketRide UI Guidelines

## Principles
- Calm, cinematic surfaces with high clarity.
- Accent color is reserved for action and state.
- Use spacing tokens for rhythm; avoid ad-hoc margins.

## Typography
- Titles: `rr-title`
- Subtitles: `rr-subtitle`
- Body: `rr-body`
- Caption + labels: `rr-caption`, `rr-label`

## Color Usage
- Use `--color-bg-primary` for app background.
- Use `--color-bg-secondary` for cards, panels, tables.
- Use `--color-accent-primary` only for primary actions and active states.

## Interaction
- Buttons always use `rr-button` + variant class.
- Hover states should be subtle and rely on accent hue shifts.

## Composition
- Use `rr-stack` and `rr-row` for layout.
- Keep layouts within `rr-container` when presenting content.

## Extending
- If you add a new component, document it in the Design System page first.
- Prefer adding new CSS modules over expanding `components.css` indefinitely.
