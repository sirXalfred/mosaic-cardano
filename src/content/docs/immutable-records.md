# Immutable Records & Verification

> [!NOTE]
> **Status & Roadmap**: On-chain verification (hashing of published works) is fully active. Contribution ledgers are currently in progress, and direct treasury audits will be introduced in future updates once village treasuries are introduced.

Mosaic uses the Cardano blockchain to record creative milestones and establish a permanent history of community activity.

## What is an Immutable Record?
In digital spaces, content can easily be deleted, edited, or claimed by others. An **immutable record** is a verification of activity written to a public blockchain ledger. Once written, it cannot be changed, forged, or removed by anyone—including the system administrators.

```
[Create Work in Studio]
           │
           ▼
  [Publish to Village]
           │
           ▼
[Generate Content Hash]
           │
           ▼
[Anchor Hash to Cardano] ◄─── (Verifiable Proof of Ownership)
```

## How Mosaic Uses Immutability

### 1. Provenance (Content Integrity)
When a project is published, Mosaic generates a unique cryptographic hash representing the work. This hash is written to the blockchain, creating a verifiable timestamp of *when* the work was completed and *who* contributed to it. This helps protect creators and establishes a clear history of how ideas were built.

### 2. Contribution Ledgers (In Progress)
User contributions—such as founding a village, mentoring members, or completing milestones—are logged. When a user requests a proof-of-activity record, we can mint a Cardano native token/metadata payload that secures their contribution history on-chain.

### 3. Treasury Auditing (Planned)
Every inflow and outflow from a Village's wallet will be publicly visible on the Cardano explorer. This ensures that funds donated or paid via subscriptions are tracked transparently, preventing misuse of community assets.

By using Cardano, Mosaic ensures that even if our databases go offline, your creative history remains permanently recorded on a global, secure ledger.
