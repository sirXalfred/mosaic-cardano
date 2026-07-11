# Mosaic Architectural Reference & Vision

This document details the complete graph architecture underlying the Mosaic platform, how our frontend manages data, and the future vision driving this project forward.

## 1. The Neo4j Graph Schema

Unlike traditional relational databases, Mosaic maps reality using a connected Graph. The fundamental architecture revolves around **Nodes** (entities) and **Edges** (relationships between them). This structure powers our rapid, deep-traversal query capabilities.

### Core Nodes

- **`Mosaic_User`**: The central actor. Contains authentication profile, wallet addresses, roles, and platform settings.
- **`Mosaic_Community`** (Villages): The foundational groups. Contains branding, rules, and treasury configurations.
- **`Mosaic_Project`**: Collaborative efforts scoped within a community.
- **`Mosaic_Piece`**: A completed, published unit of work (e.g., an article, a design, a code snippet).
- **`Mosaic_Post`**: A short-form social update, discussion thread, or announcement.
- **`Mosaic_Notification`**: In-app alerts targeted at users.
- **`Mosaic_Credential`**: Secure login identifiers for Web2/Local auth.
- **`Mosaic_Invite`**: Cryptographic invite hashes for joining restricted communities.
- **Tags (`Mosaic_Topic`, `Mosaic_Skill`)**: Semantic categorizations for discovery.

### Relationship Edges (The Connections)

- `(User)-[:MEMBER_OF {role, joinedAt}]->(Community)`
- `(User)-[:FOLLOWS {isMuted, createdAt}]->(User)`
- `(User)-[:CONTRIBUTED_TO {role, createdAt}]->(Piece)`
- `(User)-[:UPVOTED / DOWNVOTED]->(Post)`
- `(User)-[:VIEWED {durationSeconds}]->(Piece | Post)`
- `(User)-[:SAVED]->(Piece | Post)`
- `(User)-[:INVITED_BY]->(User)`
- `(Post)-[:REPLIED_TO]->(Post)`
- `(Piece | Post)-[:TAGGED_WITH]->(Topic)`

This structure allows us to instantly answer questions like: *"Show me the top upvoted posts, by users who follow me, within villages I am a member of."*

---

## 2. Frontend Data Management Habits

Our frontend strictly separates concerns to keep components atomic and responsive.

1. **React Query for Server State**: All data fetching from our `/api` routes is managed by `@tanstack/react-query`. We wrap these in custom hooks (e.g., `useGetNotifications`, `useGetFeed`). This provides automatic background refetching, infinite scrolling pagination, and robust cache invalidation.
2. **Optimistic UI Updates**: For high-frequency actions (like upvoting a post or marking a notification as read), we heavily leverage React Query's `onMutate` handlers to instantly update the UI cache *before* the server responds, ensuring a zero-latency feel.
3. **Zustand for Global UI State**: We do not use React Context for rapidly changing values. We use Zustand for UI-level global state such as Modal Management (`modals-context.ts`), Sidebar toggles, and Wallet connection states.
4. **Colocated API Fetchers**: The actual `fetch` calls are housed in `src/services/frontend/` (or directly inside the hook files) and are fully typed with Zod/TypeScript schemas shared from `src/types/schemas.ts`.

---

## 3. The Future Vision

Mosaic is not just a platform; it is a continuously evolving ecosystem. The architecture we have built today is the foundation for the following pillars:

### Community Legacy

*Mosaic Writers*

Founded  
↓  
First 5 members  
↓  
First publication  
↓  
Sarah joined  
↓  
David mentored James  
↓  
Anthology published  
↓  
Reached 100 subscribers  
↓  
Generated 500 ADA  
↓  
Inspired another Village

### User Passport

Every member accumulates reputation across communities. This way a user can preserve reputation anywhere they go within the ecosystem. It is not just a profile; it is a history.

**David**  
- **Founded**: 2 Villages  
- **Mentored**: 41 writers  
- **Published**: 18 collaborative works  
- **Earned**: 12 Proof of Activity badges  

### Derivation Graph

This is where the graph database truly shines. Imagine clicking any piece of work. Instead of opening a flat document... you open its ancestry.

You literally see creativity evolving. You can trace a final published Anthology back to the rough draft, back to the comment that sparked the idea, back to the first post in the Village.

### Community Memory + AI

Leveraging our graph, this will be highly intuitive. Not because AI is trendy, but because the graph makes the AI actually intelligent. It understands *context* and *relationships*.

Imagine opening a village and asking:  
*"Who has contributed the most to environmental writing?"*

Instant answer. The AI simply traverses the `CONTRIBUTED_TO` edges pointing to pieces `TAGGED_WITH` "environment", aggregates the weights, and responds with perfect accuracy.
