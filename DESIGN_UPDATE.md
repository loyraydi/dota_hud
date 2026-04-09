# Dota 2 HUD Design Update

## Overview
This update adapts the Dota 2 HUD to match the modern design provided in the reference images, featuring:
- Purple and yellow/gold team color scheme
- Horizontal hero displays in top bars
- Modern draft phase layout with grid-based hero selection
- Pause overlay message system

## Design References
- `public/design-reference-ingame.png` - In-game HUD design
- `public/design-reference-draft.png` - Draft phase design

## Key Changes

### 1. In-Game HUD (TopSideBar)
**File**: `src/HUD/GameHUD/TopSideBar.tsx`

**Changes**:
- Replaced vertical layout with horizontal team header bars
- Added hero portraits display (5 heroes per team)
- Integrated hero stats (gold, health, buyback status)
- Team colors: Purple (Radiant) and Yellow/Gold (Dire)
- Score display on the right side of each bar

**Visual Elements**:
- Hero portraits: 48x48px with borders
- Stats boxes with icons for gold and health
- Buyback indicator when available
- Gradient backgrounds for team identification

### 2. Draft Phase Layout
**Files**: 
- `src/HUD/Picker/Picker.tsx`
- `src/HUD/Picker/Pick.tsx`
- `src/HUD/Picker/player.scss`

**Changes**:
- Horizontal hero pick grid (5 slots per team)
- Horizontal ban display (7 slots per team)
- Modern pick boxes: 80x80px
- Team color accents on borders
- Active pick highlighting with glow effects

**Pick States**:
- Empty: Transparent with subtle border
- Picked: Hero image displayed
- Active: Border glow animation
- Ban: Grayscale with X overlay

### 3. Pause Overlay
**File**: `src/HUD/GameHUD/PauseOverlay.tsx` (new)

**Features**:
- Center-screen pause message
- Black background with white border
- Pulse animation for attention
- Automatically shows when game is paused

### 4. Team Info Bar
**File**: `src/HUD/Picker/player.scss`

**Changes**:
- Increased height to 100px
- Gradient background
- Larger team names (28px)
- Score boxes with gradient backgrounds matching team colors
- Better spacing and typography

### 5. Tournament Info
**Changes**:
- Cleaner BO (Best of) display
- Team pick indicators with colored arrows
- Purple arrow for Radiant active
- Yellow arrow for Dire active

## Color Scheme

### Team Colors
- **Radiant (Left/Purple)**:
  - Primary: `#7C3AED` (Purple 600)
  - Secondary: `#6D28D9` (Purple 700)
  - Gradient: `linear-gradient(90deg, #7C3AED, #6D28D9)`

- **Dire (Right/Yellow)**:
  - Primary: `#EAB308` (Yellow 500)
  - Secondary: `#CA8A04` (Yellow 600)
  - Gradient: `linear-gradient(90deg, #EAB308, #CA8A04)`

### Accent Colors
- Gold stats: `#FCD34D`
- Health: `#EF4444`
- Background: `rgba(0, 0, 0, 0.8)` - `rgba(0, 0, 0, 0.95)`
- Borders: `rgba(255, 255, 255, 0.1)` - `rgba(255, 255, 255, 0.3)`

## Typography
- Team names: 18px, uppercase, bold
- Hero stats: 10px
- Draft timer: 36px, bold, yellow
- Pause message: 32px, uppercase, bold

## Responsive Elements
- All elements use flexbox for proper alignment
- Smooth transitions (0.3s ease) on interactive elements
- Opacity animations for show/hide states

## Files Modified
1. `src/HUD/GameHUD/TopSideBar.tsx` - Redesigned in-game top bars
2. `src/HUD/GameHUD/gamehud.scss` - Updated styles for new layout
3. `src/HUD/Layout/Layout.tsx` - Added pause overlay, updated TopSideBar props
4. `src/HUD/Picker/Picker.tsx` - Updated draft layout structure
5. `src/HUD/Picker/Pick.tsx` - Simplified pick rendering
6. `src/HUD/Picker/player.scss` - Complete style overhaul for draft phase
7. `src/HUD/GameHUD/PauseOverlay.tsx` - New component for pause messages

## Usage Notes
- The design automatically adapts based on game state
- Team names come from the match data
- Hero data is pulled from the Dota 2 GSI integration
- All animations are CSS-based for smooth performance

## Future Enhancements
- Add camera controls sidebar (right side)
- Timeline/replay controls
- More detailed hero tooltips
- Custom team logo positioning
- Animated transitions between game states
