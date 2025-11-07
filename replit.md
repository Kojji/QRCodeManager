# QRFlow - Dynamic QR Code Management Platform

## Overview
QRFlow is a microSaaS application for creating and managing dynamic QR codes with real-time analytics. Users can create QR codes that point to any URL, customize their appearance, track scan analytics, and update destination URLs without regenerating the codes.

## Purpose
- Create dynamic QR codes with customizable colors and sizes
- Track QR code scan analytics (count, last scanned date)
- Update QR code destinations without changing the code itself
- Download QR codes in PNG format
- Manage multiple QR codes from a centralized dashboard

## Current State
The application is fully functional with:
- **Mock authentication system** (client-side only, any credentials work for demo purposes)
  - Auth state stored in sessionStorage
  - No backend user validation (as requested for MVP demo)
  - All QR codes stored under single demo user for simplicity
- In-memory NoSQL-style storage
- Complete CRUD operations for QR codes
- Dynamic redirect system with analytics tracking
- Beautiful, responsive UI with dark mode support
- Professional dashboard with statistics and management tools

**Note**: This is an MVP demo with intentionally simplified authentication. Multi-user support and persistent auth are documented in "Future Enhancements" section.

## Recent Changes (November 7, 2025)
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

### Frontend Stack
- React with TypeScript
- Wouter for routing
- TanStack Query for data fetching and caching
- Shadcn UI components with Tailwind CSS
- qrcode library for QR code generation
- date-fns for date formatting

### Backend Stack
- Express.js server
- In-memory NoSQL-style storage (MemStorage class)
- Session-based mock authentication
- RESTful API endpoints

### Key Features
1. **Authentication**
   - Mock login/signup flow using sessionStorage
   - No real password validation (demo purposes)
   - Persistent session across page reloads

2. **QR Code Management**
   - Create QR codes with custom titles and URLs
   - Customize foreground/background colors
   - Set custom size (128-1024 pixels)
   - Live preview during creation/editing
   - Download as PNG
   - Toggle active/inactive status
   - Delete QR codes

3. **Analytics**
   - Track total scans per QR code
   - Record last scanned timestamp
   - Display aggregate statistics
   - Calculate average scans per code

4. **Dynamic Redirects**
   - Short code generation (6 characters)
   - Automatic redirect on scan
   - Scan count incrementation
   - Active/inactive status enforcement

### File Structure
```
client/
  src/
    components/
      ui/ - Shadcn UI components
      app-sidebar.tsx - Navigation sidebar
      qr-code-card.tsx - QR code display card
      qr-code-dialog.tsx - Create/edit modal
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
- `POST /api/qrcodes` - Create new QR code
- `GET /api/qrcodes` - Get all QR codes for user
- `GET /api/qrcodes/:id` - Get specific QR code
- `PATCH /api/qrcodes/:id` - Update QR code
- `DELETE /api/qrcodes/:id` - Delete QR code
- `GET /api/qr/:shortCode` - Redirect and track scan

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
