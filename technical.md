# Mosaic Technical Architecture & Design Decisions

This document outlines the core technical and architectural decisions made in building Mosaic. While we rely on standard modern web tooling for much of our stack (Next.js, Tailwind, Zustand), our unique requirements around community relationships, on-chain integrations, and collaborative creation required some unconventional design choices.

---

## 1. Project Layout & Organization

We structured the `src` directory to strongly decouple business logic from UI rendering, keeping the Next.js App Router clean and testable.

- `app/`: Exclusively for Next.js routing (pages, layouts, and `/api` route handlers). We keep these files thin, delegating logic to the `services` layer.
- `components/`: UI components broken down into atomic, reusable pieces (e.g., Shadcn UI).
- `services/`: The core backend business logic. All database queries and external integrations run through this layer rather than cluttering API route handlers.
- `lib/`: Configuration and singleton clients (Neo4j driver, Redis client, UI utilities).
- `store/` & `hooks/`: Client-side state management (Zustand) and reusable React logic (React Query hooks).
- `types/`: Centralized TypeScript interfaces shared across the full stack.
- `middleware.ts`: Centralized middleware for authentication checks, session management, and edge routing logic.

This layout enforces a clear boundary between backend services, API communication, and frontend rendering, making the codebase highly maintainable.

---

## 2. The Database: Graph Over Relational (Neo4j)

### The Decision
We chose **Neo4j**, a graph database, over traditional relational databases (like PostgreSQL) or document stores (like MongoDB). 

### The Rationale
Mosaic’s core data model is highly interconnected. Users belong to multiple villages, author specific *pieces* (formerly referred to as artifacts), vote on posts, and participate in challenges. In a relational database, querying these deep relationships (e.g., "Find all users in Village A who contributed to Piece B and voted on Post C") requires complex and expensive `JOIN` operations. 

A graph database models these relationships natively using Nodes and Edges. This allows for extremely fast traversal of complex queries, making features like the Explore feed, community activity logs, and interconnected user profiles highly performant.

### The Memgraph vs. Neo4j Trade-Off
During development, we experienced significant friction with our database deployment, highlighting a classic technical trade-off: **infrastructure constraints vs. resource efficiency**.

1. **The Startup Resource Issue:** We initially built on Neo4j, but discovered that it was highly resource-intensive on our VPS. It consumed significant storage and RAM just to initialize, leaving very little headroom for the rest of our application.
2. **The Memgraph Pivot:** To reduce our footprint, we switched to **Memgraph**, an in-memory graph database. Because Memgraph uses the exact same Cypher queries (OpenCypher compatible) as Neo4j, we were able to seamlessly swap the database engine without rewriting our `services/` layer.
3. **The VPS Permission Blocker:** Unfortunately, when deploying Memgraph via Docker, the container required root-level permissions on the host system to create its persistent storage directories. Our VPS environment strictly prohibits this level of root access.
4. **The Revert:** Unable to bypass the permission restrictions of our hosting provider, we were forced to migrate *back* to Neo4j. We have decided to accept the heavier resource footprint of Neo4j to "manage our fate" and ensure stable deployments without hitting hard infrastructure permission walls.

*(Note: We specifically namespace our node labels in Neo4j to allow for safe scaling and future multi-tenant project differentiation).*

## 2. Web3 & Blockchain Layer (MeshSDK)

### The Decision
We opted to use **MeshSDK** for our Cardano integrations rather than writing custom Plutus smart contracts and raw transaction builders from scratch.

### The Rationale
Our immediate goal is to prove value to communities. MeshSDK provides a robust, production-ready abstraction for connecting wallets, querying assets, and building transactions. 
- **Lazy Loading & Performance:** Web3 libraries are notoriously heavy and often cause SSR (Server-Side Rendering) issues. We explicitly refactored our architecture to strictly dynamically import (lazy-load) MeshSDK components and hooks. This keeps the initial bundle size small and prevents Next.js hydration errors.
- **Metadata Verification:** To bridge the off-chain (database) and on-chain (Cardano) worlds, our subscription and payment flows include `userId` metadata verification. When a payment is made on-chain, it includes the user's ID, which our backend API (`/api` payment services) verifies to securely grant plan upgrades and access.

## 3. Authentication & Wallet Linking

### The Decision
We implemented a custom secure wallet login and linking system using **Nonce Verification**, bypassing traditional username/password flows.

### The Rationale
Because identity in Web3 is tied to wallets, our authentication flow requires cryptographic proof of ownership. When a user logs in, the backend generates a unique nonce. The user signs this nonce with their Cardano wallet. The server verifies the signature before issuing a secure session. 
We also implemented a centralized `withAuth` API decorator and strict session invalidation to ensure that users are properly logged out across all active sessions when required.

## 4. Caching & Concurrency (Redis)

### The Decision
We use **Redis** (`ioredis`) for session management, performance caching, and crucially, **distributed caching locks**.

### The Rationale
When multiple users interact with the same community data concurrently—such as during village soft-deletion or mass plan-level updates—race conditions can occur. We use Redis to implement distributed locks, ensuring that critical mutations to community states are processed atomically. Additionally, Redis caches heavy Graph queries to keep the Explore and Feed pages extremely snappy.

## 5. The Studio: Offline-First & Optimistic UI

### The Decision
The collaborative editor (Studio) leverages a "browser DB" (local storage/IndexedDB mechanics) integrated directly with our API data resolution.

### The Rationale
Writers and creators need a robust editor that doesn't lose work if the connection drops (a common scenario for our target demographic in Africa). Drafts are saved aggressively to the local browser environment and then resolved/synced seamlessly with the backend API. 
Furthermore, interactions like posting and voting utilize **optimistic updates**. The UI updates instantly while the React Query mutation runs in the background, providing a premium, zero-latency feel.

## 6. Security: Planguard & Asset Locking

### The Decision
We built a custom restriction system called **Planguard** and locked down all external asset domains.

### The Rationale
- **Planguard:** Restricting features based on subscription plans isn't just a UI toggle. We built a holistic guard system (`planguard`) that acts as middleware to prevent unauthorized API access, ensuring that restrictions are enforced at the server level, not just hidden on the client.
- **Asset Locking:** To prevent XSS and malicious injections via user profiles, we strictly enforce dynamic avatars and uploads via our Next.js configuration. All external image sources are locked down exclusively to our approved providers (`dicebear` for generated avatars and `cloudinary` for secure user uploads).

---

## 7. The Standard Stack (Brief Overview)

While the above decisions are specialized, the rest of our stack relies on proven, modern defaults:
- **Framework:** Next.js (App Router) for hybrid rendering and API route collocation.
- **State Management:** Zustand for lightweight global state (like active wallet and UI toggles) and React Query for server state and caching.
- **Styling & UI:** Tailwind CSS combined with Shadcn UI & Radix UI primitives for accessible, rapid UI development. Framer Motion is sprinkled in for micro-interactions.
- **Editor:** TipTap (headless prose mirror) for our highly customizable rich-text Studio experience.

## 8. Unified API Middleware (withAuth / withAdminAuth)

### The Decision
We wrap all secured API route handlers with higher-order functions (`withAuth` and `withAdminAuth`) rather than repeating session checks in every route.

### The Rationale
In Next.js App Router, verifying cookies and headers for every secure endpoint introduces significant boilerplate. It also makes it easy to accidentally miss a check, leading to security vulnerabilities. By using a wrapper pattern, we intercept the `Request`, validate the JWT session, fetch the associated user, verify roles (e.g., `ADMIN`), and seamlessly inject the `userId` directly into the route handler's context. This guarantees that if a route's core logic executes, the request is unconditionally authenticated and authorized, centralizing our RBAC (Role-Based Access Control) in one auditable location.

## 9. Notification & Broadcasting Engine

### The Decision
We built a unified Notification Service that handles both persistent in-app notifications (saved to Neo4j) and volatile Web Push notifications (via Service Workers and VAPID) simultaneously.

### The Rationale
Real-time engagement is critical for community-driven platforms. Instead of treating push notifications and in-app alerts as separate systems, we engineered a central `notification.service.ts` that broadcasts to both channels concurrently. When an event occurs (e.g., a system admin broadcasting a message, or a user joining a village), the service writes the node to Neo4j for the user's permanent inbox and immediately dispatches a Web Push payload to their registered device subscriptions. This guarantees users are alerted instantly even when the app is closed, while maintaining a durable history when they return to the `/inbox`.
