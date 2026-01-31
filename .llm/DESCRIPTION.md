# Project Overview: 3D Pain Mapping Application

## Purpose

A hackathon application that allows users to visualize and document physical pain on an interactive 3D human body model.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React Three Fiber, Tailwind CSS v4
- **Backend**: tRPC, Drizzle ORM (PostgreSQL)
- **Internationalization**: next-intl
- **State Management**: Zustand
- **Infrastructure**: Docker (dev/prod)

## Current Status

✅ Functional foundation with:

- tRPC configured and working
- i18n routing setup
- Server structure in place
- Database configuration ready

## Core Functionality

### User Flow

```
Landing Page → Create Session → 3D Body Viewer → Click to Add Pain Points → Edit Details → Auto-save
```

### Key Features

1. **3D Interaction**: Click on a 3D human model to place pain markers
2. **Pain Documentation**: Add labels and notes to each pain point
3. **Real-time Persistence**: Automatic saving via tRPC mutations
4. **Session Management**: Create and manage pain documentation sessions

## Data Model

- **Sessions**: Container for pain mapping instances
- **Pain Points**: Individual markers with:
  - 3D coordinates (x, y, z position on model)
  - Label (quick identifier)
  - Notes (detailed description)
  - Timestamps
