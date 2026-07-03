# Mosaic Badges Reference

This document outlines the reputation badges available on the Mosaic platform, what they represent, and the specific actions that trigger them.

## Badges Overview

| Slug | Display Name | Icon | Trigger Condition |
| :--- | :--- | :--- | :--- |
| `early-user` | Early User | 🌱 | Awarded when a user completes onboarding and the application is not yet in production (`NEXT_PUBLIC_APP_STAGE !== 'production'`). |
| `early-adopter` | Early Adopter | 🚀 | Awarded when a user creates their first Village/Community while the application is not yet in production. (Replaces the legacy `Pioneer` badge). |
| `first-post` | Town Crier | 📢 | Awarded when a user publishes their first post within any community. |
| `first-feedback` | Pioneer Voice | 🗣️ | Awarded when an authenticated user submits their first feedback via the Support & Feedback modal (and chooses not to remain anonymous). |
| `first-invite` | The Welcomer | 🤝 | Awarded when a user generates their first community invite link. |
| `first-document` | Archivist | 📜 | Awarded when a user publishes their first Document/Piece inside the Studio. |

## Future Expansion
Additional badges should be registered both here and in the frontend `BADGE_MAP` (`src/lib/badges.ts`) to ensure they render correctly across the application. Backend triggers must be explicitly wired to use the unique `Slug` to track claims and ownership.
