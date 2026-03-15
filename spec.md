# Our Personal Diary

## Current State
- PlainPage and NormalPage are single long textarea components with a Save button
- LandingPage has an "Open Diary" button that immediately transitions to PinLock state
- Book cover is a 3D-styled static element; animation is a simple scale/opacity transition, no actual page-flip revealing inner spread

## Requested Changes (Diff)

### Add
- Multi-page pagination for PlainPage and NormalPage:
  - Each page shows exactly 12 ruled lines (for NormalPage) or a fixed-height text area (~12 lines) for PlainPage
  - "Previous Page" button (disabled on page 1) and "Next Page" button
  - All pages held in memory (array of strings) until user explicitly saves
  - On Save: saves all pages joined together, shows total page count in toast
  - Page counter indicator (e.g. "Page 2 of 4")
- Book open animation on LandingPage:
  - A visible 3D book with front cover + spine + visible pages on the right side
  - On "Open Diary" click: front cover flips open (rotateY from 0 to -180deg) revealing inner left page + right page spread
  - After flip completes (~800ms), transitions to PinLock

### Modify
- PlainPage: replace single textarea with paginated page system
- NormalPage: replace single textarea with paginated page system
- LandingPage: replace simple button with full 3D book visual + flip animation

### Remove
- Single-textarea approach in PlainPage and NormalPage

## Implementation Plan
1. Create a `usePaginatedPages` hook: manages array of page strings, currentPage index, navigation handlers, and combined save content
2. Rewrite `PlainPage` to use `usePaginatedPages` -- fixed-height textarea, Prev/Next buttons, page indicator, Save button
3. Rewrite `NormalPage` to use `usePaginatedPages` -- lined paper layout with fixed 12 lines visible, Prev/Next buttons, page indicator, Save button
4. Rewrite `LandingPage` book visual:
   - Render a 3D book with CSS perspective: front cover (left half), back/pages (right half)
   - On click, animate cover `rotateY: 0 → -180` with `transformOrigin: left center`
   - After animation, show inner spread (left blank page + right blank page) for ~300ms then call `onOpen`
5. Both theme styles applied throughout (girlish pink / boyish dark)
