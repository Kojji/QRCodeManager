# QRFlow - Dynamic QR Code Management Platform

## Overview
QRFlow is a microSaaS application for creating and managing dynamic QR codes with real-time analytics. Users can create QR codes that point to any URL, customize their appearance, track scan analytics, and update destination URLs without regenerating the codes.

## Purpose
- Create dynamic QR codes with customizable colors and sizes
- Organize QR codes into groups for campaign management
- Track QR code scan analytics (count, last scanned date)
- Visualize URL variations across groups (paths and parameters)
- Update QR code destinations without changing the code itself
- Download QR codes in PNG format
- Manage multiple QR codes from a centralized dashboard

## Current State
The application is fully functional with:
- **Client-side only architecture** (no backend server required)
  - Pure React/Vite application
  - All data persistence handled through Firebase Firestore
  - Deployed as a static web application
- **Firebase Integration**
  - Firebase Firestore for persistent data storage
  - Firebase Authentication (mock auth for demo)
  - Environment variables securely managed via Replit Secrets with VITE_ prefix
  - Configuration in `client/src/firebase/index.ts`
- Complete CRUD operations for QR codes and groups
- **QR Code Groups** for organizing codes with URL variations
  - Group QR codes that share a base URL
  - Visualize path and parameter variations
  - Track group-level analytics
- Dynamic redirect system with analytics tracking
- Beautiful, responsive UI with dark mode support
- Professional dashboard with statistics and management tools

**Note**: This version uses Firebase for persistent storage, replacing the previous in-memory storage approach.

## Recent Changes

### November 16, 2025
- **Firebase Integration** (Latest)
  - Migrated from in-memory storage to Firebase Firestore for persistent data
  - Removed backend server (Express.js) - now fully client-side application
  - Updated package.json scripts to run Vite directly on port 5000
  - Configured Firebase with VITE_ prefixed environment variables for Vite compatibility
  - Updated `client/src/firebase/index.ts` to use proper Vite env variable format
  - All QR codes and groups now persist across sessions via Firestore
  - Installed Firebase SDK (v12.5.0)
  - Configured Vite to run on port 5000 with `--host 0.0.0.0` for Replit compatibility

### November 7, 2025
- **Static QR Code Feature**
  - Added "Static QR Code" button to sidebar under Actions section
  - Created dialog to generate QR codes without database storage
  - Live preview with instant updates on any field change
  - Customizable foreground/background colors and size (128-1024px)
  - Auto-prepend "https://" to URLs without protocol
  - Download generated QR codes as PNG files
  - Form auto-resets when dialog closes
  - Input validation prevents NaN values in size field
  - End-to-end tested and architect-approved
- **Auto-prepend HTTPS to Group Base URL**
  - Applied same auto-prepend functionality from QR Code dialog
  - Fixed form population bug in Edit Group dialog using useEffect
  - Works in both create and edit workflows
- **QR Code Analytics Feature**
  - Added scan history tracking with timestamps
  - Created analytics dialog showing 4 key metrics:
    - Total scans since creation
    - Scans for current month
    - Average scans per month
    - Percentage change (current month vs average)
  - Added "Scans" button to QR code dropdown menu
  - Color-coded trend indicators (green/red for increase/decrease)
  - Quick stats showing creation date, last scanned time, and status
  - End-to-end tested with multiple scans
- **Enhanced QR Code Dialog**
  - Added URL parameters field for easier campaign tracking
  - Auto-prepend "https://" to URLs without protocol
  - Automatic parameter extraction when editing existing codes
  - Live preview updates with combined URL and parameters
- **Auth Route Protection**
  - Implemented AuthRoute component to prevent logged-in users from accessing login/signup
  - Sidebar hidden on authentication pages
  - Automatic redirect to dashboard when logged-in users try to access auth pages
- **QR Code Groups Feature**
  - Added QRCodeGroup schema with full CRUD operations
  - Created Groups page with list view and group cards
  - Implemented Group Detail page with URL variation visualization
  - Added group selector to QR code creation/edit dialog
  - Built group analytics (total scans, QR count, avg scans per code)
  - Automatic URL variation detection (paths vs parameters)
  - End-to-end tested and verified all functionality
- Initial project setup with schema-first development
- Implemented complete data models for Users and QR Codes
- Created beautiful authentication pages (Login/Signup) with mocked auth flow
- Built full dashboard with sidebar navigation using Shadcn UI
- Implemented QR code creation/edit dialog with live preview
- Added QR code cards with comprehensive management options
- Created stats cards showing key metrics (total codes, scans, active codes, avg scans)
- Implemented backend API endpoints for all CRUD operations
- Added dynamic redirect system with scan tracking
- Configured theme provider for light/dark mode support

## User Preferences
- Clean, professional SaaS interface inspired by Linear and Notion
- Minimalist design with focus on functionality
- Responsive layout that works on all devices
- Subtle animations and smooth transitions
- Professional color scheme with purple primary color

## Project Architecture

### Tech Stack
- React with TypeScript
- Vite for development and build tooling
- Wouter for routing
- TanStack Query for data fetching and caching
- Shadcn UI components with Tailwind CSS
- qrcode library for QR code generation
- date-fns for date formatting
- Firebase (v12.5.0)
  - Firestore for persistent data storage
  - Authentication SDK (configured for future use)

### Key Features
1. **Authentication**
   - Mock login/signup flow using sessionStorage
   - No real password validation (demo purposes)
   - Persistent session across page reloads

2. **Dynamic QR Code Management**
   - Create QR codes with custom titles and URLs
   - Customize foreground/background colors
   - Set custom size (128-1024 pixels)
   - Live preview during creation/editing
   - Download as PNG
   - Toggle active/inactive status
   - Assign QR codes to groups
   - Delete QR codes

2a. **Static QR Code Generation**
   - Quick QR code creation without database storage
   - Perfect for one-time use or testing
   - Accessible via sidebar "Static QR Code" button
   - Same customization options (colors, size)
   - Instant live preview on canvas
   - Direct download as PNG
   - No account/storage overhead

3. **QR Code Groups**
   - Create groups to organize related QR codes
   - Set base URL for group consistency
   - Visualize URL variations (paths vs parameters)
   - Track group-level analytics
   - View all QR codes within a group
   - Edit and delete groups
   - Optional group assignment for flexibility

4. **Individual QR Code Analytics**
   - View detailed analytics for each QR code via "Scans" menu item
   - Total scans since creation
   - Current month scan count
   - Average scans per month (calculated from creation date)
   - Percentage change (current month vs average)
   - Visual trend indicators (green up arrow, red down arrow)
   - Quick stats: creation date, last scanned time, active status
   - Scan history tracking with timestamps

5. **Analytics Dashboard**
   - Track total scans per QR code
   - Record last scanned timestamp
   - Display aggregate statistics
   - Calculate average scans per code
   - Group-level analytics (total scans, QR count)

6. **Dynamic Redirects**
   - Short code generation (6 characters)
   - Automatic redirect on scan
   - Scan count incrementation with timestamp tracking
   - Active/inactive status enforcement
   - Scan history tracking for analytics

### File Structure
```
client/
  src/
    components/
      ui/ - Shadcn UI components
      app-sidebar.tsx - Navigation sidebar
      qr-code-card.tsx - QR code display card
      qr-code-dialog.tsx - Create/edit modal with group selector and URL parameters
      qr-analytics-dialog.tsx - Analytics dialog with scan statistics
      group-dialog.tsx - Create/edit group modal
      stats-card.tsx - Statistics display
      theme-provider.tsx - Dark mode provider
      theme-toggle.tsx - Theme switch button
    lib/
      auth.tsx - Authentication context
      queryClient.ts - API configuration
    pages/
      login.tsx - Login page
      signup.tsx - Signup page
      dashboard.tsx - Main dashboard
      groups.tsx - Groups list page
      group-detail.tsx - Group detail with analytics
      qr-redirect.tsx - QR scan redirect handler
      not-found.tsx - 404 page
    App.tsx - Main app with routing
    index.css - Global styles with design tokens
    
server/
  routes.ts - API endpoints
  storage.ts - In-memory data storage
  
shared/
  schema.ts - TypeScript types and Zod schemas
```

### API Endpoints

**QR Codes**
- `POST /api/qrcodes` - Create new QR code
- `GET /api/qrcodes` - Get all QR codes for user
- `GET /api/qrcodes/:id` - Get specific QR code
- `PATCH /api/qrcodes/:id` - Update QR code
- `DELETE /api/qrcodes/:id` - Delete QR code
- `GET /api/qr/:shortCode` - Redirect and track scan

**Groups**
- `POST /api/groups` - Create new group
- `GET /api/groups` - Get all groups for user
- `GET /api/groups/:id` - Get specific group
- `PATCH /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `GET /api/groups/:id/qrcodes` - Get all QR codes in group

### Design System
- Primary color: Purple (#8B5CF6 - 262 83% 58%)
- Clean, minimal interface with subtle borders
- Card-based layouts with hover effects
- Consistent spacing (4, 6, 8, 12, 16)
- Professional typography with Inter font
- Responsive grid layouts (1-2-3 columns)

## Technology Decisions
- **In-memory storage**: Fast, simple, ideal for MVP and demo purposes
- **Mock authentication**: Allows full UX testing without backend complexity
- **Shadcn UI**: Professional components with excellent accessibility
- **QRCode library**: Reliable QR generation with customization options
- **TanStack Query**: Robust data fetching with caching and optimistic updates

## Future Enhancements (Not in MVP)
- Real user authentication with password hashing
- Persistent database (PostgreSQL or MongoDB)
- Advanced analytics (geographic data, device types, time-based charts)
- QR code templates and bulk operations
- Team collaboration features
- Payment integration for tiered plans
- Custom domains for short links
- API access for developers
- Export analytics as CSV/PDF
