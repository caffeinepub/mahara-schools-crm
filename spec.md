# Mahara Schools CRM

## Current State
- Full CRM platform with role-based access, lead management, academics, staff management, parent portal, etc.
- White page on load (likely security module crash or actor initialization error)
- Current UI uses Inter font, teal gradient sidebar, generic color tokens
- No brand-specific typography system

## Requested Changes (Diff)

### Add
- Mahara brand typography: Google Fonts imports for ULM Grotesque (closest: Bricolage Grotesque Extra Bold), Peachy Keen JF (closest: Fraunces italic/display), Typold (closest: Plus Jakarta Sans) as CSS @import + Tailwind fontFamily tokens
- Font role assignments: display font for logo/subheadings/promo lines, heading font for page headings, body font for paragraphs
- Full Mahara color token system in CSS custom properties and Tailwind
- Root-level error boundary in main.tsx to catch white page crashes
- Safe async initialization (actor seeding wrapped in try/catch, security setup wrapped in try/catch)

### Modify
- index.css: Replace generic teal tokens with exact Mahara color hierarchy (Blue #65A0E3 background, Pink #F2B0CB, Purple #B2A8D1, Teal #91D3CF versatile, Yellow #FFE600 accent, Lime #BCD800 accent)
- LoginPage: Apply brand colors and typography — blue background, brand fonts, clean minimal layout
- Sidebar: Teal (#91D3CF) base, brand typography for nav labels
- TopBar: Brand fonts and color hierarchy
- AppShell/App: Add top-level error boundary to prevent white page
- security.ts: Wrap all setup in try/catch so it never crashes the app

### Remove
- Nothing removed

## Implementation Plan
1. Fix App.tsx / main.tsx: wrap entire render tree in error boundary, wrap security setup in try/catch
2. Update index.css: new Mahara color tokens + Google Fonts imports for brand typography
3. Update tailwind.config.js: register font families + extend color palette with mahara- tokens
4. Update LoginPage: blue background, brand fonts, clean layout per spec
5. Update Sidebar: teal background, brand font labels
6. Update TopBar: brand fonts applied
7. Build and validate
