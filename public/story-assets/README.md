# Story Mode Assets

This directory contains visual assets for WordCraft's story mode.

## Selected Theme: Space Adventure 🚀

**Rationale:**
- ✅ Universal appeal (ages 5-10, all genders)
- ✅ Abundant free assets available
- ✅ Exciting and motivating for children
- ✅ Clear progression metaphor (journey through space)
- ✅ Gender-neutral and culturally inclusive

## Directory Structure

```
story-assets/
├── characters/          # Character sprites (astronaut)
│   ├── astronaut-neutral.svg
│   ├── astronaut-celebrating.svg
│   └── astronaut-thinking.svg
├── backgrounds/         # Environment scenes
│   ├── intro-space-station.svg
│   ├── checkpoint1-moon.svg
│   ├── checkpoint2-mars.svg
│   ├── checkpoint3-jupiter.svg
│   └── finale-stars.svg
└── icons/              # UI icons
    ├── checkpoint-star.svg
    ├── progress-dot.svg
    └── lock-icon.svg
```

## Asset Requirements

### Characters (200x200px to 400x400px)
- **astronaut-neutral.svg** - Default pose for gameplay
- **astronaut-celebrating.svg** - Arms raised, happy expression
- **astronaut-thinking.svg** - Pondering pose, hand on helmet

### Backgrounds (1200x800px, 3:2 ratio)
- **intro-space-station.svg** - Starting location
- **checkpoint1-moon.svg** - First milestone (Moon surface)
- **checkpoint2-mars.svg** - Second milestone (Mars landscape)
- **checkpoint3-jupiter.svg** - Third milestone (Jupiter orbit)
- **finale-stars.svg** - Victory scene (star field)

### Icons (48x48px to 128x128px)
- **checkpoint-star.svg** - Checkpoint marker
- **progress-dot.svg** - Progress indicator
- **lock-icon.svg** - Locked checkpoint icon

## Free Asset Sources

### Recommended Resources:

1. **unDraw** (https://undraw.co)
   - License: MIT/Open Source
   - Customizable SVG illustrations
   - Space-themed illustrations available
   - Can customize colors to match app theme

2. **Blush** (https://blush.design)
   - License: Free with attribution
   - Diverse illustration styles
   - Regularly updated collections

3. **SVG Repo** (https://www.svgrepo.com)
   - License: Various (check individual)
   - Large collection of icons and illustrations
   - Search: "astronaut", "space", "planet", "star"

4. **Open Doodles** (https://opendoodles.com)
   - License: CC0 (Public Domain)
   - Hand-drawn style
   - Customizable colors

5. **Humaaans** (https://humaaans.com)
   - License: Free for commercial use
   - Customizable people illustrations
   - Can create astronaut variations

### NASA Resources:
- **NASA Image Library** (https://images.nasa.gov)
  - Public domain images
  - Authentic space photos for backgrounds
  - Requires attribution

## Color Palette (Space Theme)

```css
--story-primary: #4A5FFF;      /* Deep blue */
--story-secondary: #FFB84D;    /* Warm yellow/orange */
--story-accent: #A78BFA;       /* Purple */
--story-background: #1E1B4B;   /* Dark space blue */
--story-text: #F8FAFC;         /* Light text */
```

## Asset Optimization

Before adding assets to this directory:

1. **SVG Files:**
   - Use SVGO to optimize: `npx svgo -f story-assets/`
   - Remove unnecessary metadata
   - Ensure viewBox is set correctly

2. **Raster Images (PNG/WebP):**
   - Compress with ImageOptim or TinyPNG
   - Target: <100KB per image
   - Use WebP format for modern browsers

3. **Performance:**
   - Lazy load large backgrounds
   - Preload critical assets (character sprites)
   - Use appropriate image formats

## Attribution

When adding assets, document their source and license here:

### Current Assets:
- _To be added when assets are collected_

### Example:
```
- astronaut-neutral.svg
  Source: unDraw (https://undraw.co)
  License: MIT
  Modifications: Recolored to match app theme
```

## Future Themes

Additional themes can be added following the same structure:
- **Treasure Hunt:** Pirate theme with islands and treasure
- **Fantasy Quest:** Castle theme with magical elements
- **Underwater Journey:** Ocean theme with sea creatures

Each theme should have its own subdirectories mirroring the space theme structure.

## Implementation

Assets are referenced in `/lib/story/assets.ts` which provides typed paths for all story mode components.

## Development Mode

For development without final assets:
1. Use placeholder SVGs or colored rectangles
2. Ensure correct dimensions and aspect ratios
3. Replace with actual assets before production release

---

**Note:** This is a placeholder README. Update it with actual asset sources and attributions as assets are added.
