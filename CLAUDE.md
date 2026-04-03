# MeetMind — AI Meeting Summary Tool

## Project
A web app where users see a list of their meetings and can add
AI-structured summaries to each one. User pastes or types
unstructured notes → Claude AI transforms them into a structured
summary with Context, Main Ideas, and Action Points.
No backend — localStorage for all data.
Claude API for AI transformation.

## Stack
- React + Vite
- CSS Modules (NO Tailwind, NO inline styles)
- lucide-react for icons
- Inter font (Google Fonts)
- localStorage for persistence
- Claude API (claude-sonnet-4-20250514) for summary generation

## Visual Direction
Dark, precise, minimal. Inspired by Cron calendar and Raycast.
- Clean sidebar + main content layout like Cron
- Crisp typography, generous whitespace
- Subtle borders, no heavy shadows
- Feels like a professional productivity tool

Colors:
- bg-base: #0F0F10
- bg-sidebar: #141415
- bg-surface: #1C1C1E
- bg-elevated: #242426
- accent: #6366F1 (indigo — professional, AI feel)
- accent-hover: #818CF8
- accent-muted: rgba(99, 102, 241, 0.15)
- text-primary: #F5F5F7
- text-secondary: #8E8E93
- text-muted: #48484A
- border: rgba(255,255,255,0.06)
- border-strong: rgba(255,255,255,0.10)
- success: #34C759
- warning: #FF9F0A

Radius: 12px cards / 8px buttons / 6px tags
Font: Inter (Google Fonts)
Transitions: 200ms ease

## Code Conventions
- One component per file
- Components in src/components/
- CSS Module per component
- Functional components only
- No console.log in final code
- No inline styles
- Always use CSS variables from global.css

## UX Principles
- Desktop-first, responsive down to 375px mobile
- Two-panel layout on desktop: meeting list left, detail right
- Single panel on mobile: list → tap → detail
- Every interactive element has hover + active state
- Loading state while AI is processing
- Empty states handled gracefully

## What NOT to do
- No Tailwind
- No inline styles
- No class components
- No real calendar API integration
- No user authentication
