# Design Guidelines: Dynamic QR Code Management Platform

## Design Approach

**Selected Approach**: Design System (Linear + Notion inspired)
**Rationale**: This is a utility-focused SaaS tool where efficiency, clarity, and professional aesthetics drive user trust and productivity. Drawing from Linear's clean interface and Notion's approachable data management patterns.

**Core Principles**:
- Clarity over decoration
- Efficient workflows with minimal cognitive load
- Professional polish that instills trust
- Data-first presentation with clear hierarchy

---

## Typography System

**Font Stack**: 
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for QR codes, analytics)

**Hierarchy**:
- Page Titles: text-3xl to text-4xl, font-semibold
- Section Headers: text-2xl, font-semibold
- Card Titles: text-lg, font-medium
- Body Text: text-base, font-normal
- Captions/Meta: text-sm, text-xs for timestamps
- Button Text: text-sm, font-medium

---

## Layout System

**Spacing Primitives**: Tailwind units 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section spacing: space-y-6, space-y-8
- Grid gaps: gap-4, gap-6
- Margins: m-2, m-4, m-8

**Container Strategy**:
- Dashboard/App: max-w-7xl with px-4 md:px-6 lg:px-8
- Auth pages: max-w-md centered
- Form sections: max-w-2xl

---

## Page Layouts

### Authentication Pages (Login/Signup)

**Layout**: Centered card on full viewport
- Single column form (max-w-md)
- Logo/brand mark centered above form
- Form fields with generous spacing (space-y-4)
- Primary CTA button full-width
- Secondary actions (links) below in text-sm
- Footer with minimal links at bottom

**Components**:
- Input fields with labels above
- Password field with show/hide toggle
- Remember me checkbox
- Error message display area
- Social proof micro-copy ("Join 10,000+ users")

### Dashboard (Main Application View)

**Layout**: Sidebar + Main Content
- Left sidebar (w-64): Navigation, user profile, upgrade CTA
- Main content area: Header bar + scrollable content
- Header: Page title, search, create QR button, user menu
- Content grid: 3-column responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

**Dashboard Sections**:
1. Stats Overview Bar: 4-column metrics (total QR codes, total scans, active codes, scan rate)
2. Quick Actions Card: Create new QR code prominent button
3. QR Code Grid: Cards displaying each QR code with preview, title, analytics preview, actions

### QR Code Creation/Edit Modal

**Layout**: Centered overlay modal (max-w-3xl)
- Two-column split: Form (left 60%) + Live Preview (right 40%)
- Tabbed interface for QR types (URL, Text, vCard, WiFi)
- Color customization section with color pickers
- Advanced options collapsible section
- Bottom action bar: Cancel + Save buttons

### Individual QR Code Detail Page

**Layout**: Single column with sidebar
- Main content: Large QR code preview, download options, edit button
- Analytics panel: Line chart for scans over time
- Recent scans table: Date/time, location (mocked), device type
- Settings section: Toggle active/inactive, regenerate, delete

---

## Component Library

### Navigation
- Vertical sidebar navigation with icons (Heroicons)
- Active state with subtle indicator
- Collapsible on mobile (hamburger menu)

### Cards
- Elevated cards with subtle shadow
- Rounded corners (rounded-lg)
- QR Code Cards include: thumbnail, title, destination URL (truncated), scan count, created date, action menu (3-dot)

### Forms
- Labels positioned above inputs
- Input fields with border, focus ring
- Inline validation messages
- Multi-step forms with progress indicator for complex creation flows

### Buttons
- Primary: Solid background, medium weight text
- Secondary: Outline style
- Icon buttons: Square, icon-only for actions
- Sizes: btn-sm, btn-md, btn-lg

### Data Display
- Tables: Striped rows, hover states, sortable headers
- Analytics charts: Line/bar charts using Chart.js or similar
- Stat cards: Large number, label below, optional trend indicator
- Empty states: Illustration + helpful message + CTA

### Modals/Overlays
- Backdrop overlay with blur effect
- Modal content with rounded corners, padding
- Header with close button
- Footer with action buttons right-aligned

---

## Icons & Assets

**Icon Library**: Heroicons (via CDN) - outline style for navigation, solid for actions
**Key Icons Needed**: QrCode, ChartBar, Cog, Download, Pencil, Trash, Plus, X, Menu, User

---

## Images

**Hero/Marketing Elements**: 
- No large hero image for dashboard (utility-focused)
- Authentication pages: Optional branded illustration on left side (split-screen layout for desktop)
- Empty states: Use simple illustrations (undraw.co style) for "No QR codes yet"
- QR code previews: Generated QR codes displayed at 200x200px minimum

**Image Descriptions**:
1. Auth illustration: Abstract/geometric representation of QR codes, connections, data flow
2. Empty state: Person holding phone scanning QR code, friendly and encouraging

---

## Responsive Behavior

**Breakpoints**:
- Mobile (<768px): Single column, stacked layouts, bottom navigation
- Tablet (768-1024px): 2-column grids, visible sidebar
- Desktop (>1024px): 3-column grids, full sidebar, optimized spacing

**Mobile Optimizations**:
- Hamburger menu replaces sidebar
- QR code grid becomes single column
- Modal becomes full-screen on mobile
- Bottom tab bar for primary navigation

---

## Animation & Interactions

**Minimal Motion**:
- Smooth page transitions (fade in)
- Modal entrance/exit (scale + fade)
- Hover states: Subtle elevation change on cards
- Loading states: Skeleton screens for content, spinner for actions

Avoid: Elaborate scroll animations, parallax effects, unnecessary motion

---

## Accessibility

- Consistent focus indicators on all interactive elements
- Form inputs with proper labels and aria-labels
- Keyboard navigation support throughout
- Sufficient contrast ratios
- Screen reader friendly labels for icon buttons