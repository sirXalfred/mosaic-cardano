# Community Governance

> [!NOTE]
> **Future Vision & Roadmap**: Community governance features are planned for future phases of the platform. Currently, villages operate under a **Progressive Decentralization** model: communities start in a bootstrap phase under founder stewardship, and control will transition to community-driven voting as the village matures.

Governance on Mosaic allows villages to:
1. **Define Rules**: Establish community guidelines and onboarding requirements.
2. **Propose Actions**: Submit requests for funding, project approvals, or community changes.
3. **Decide Together**: Use simple voting to reach consensus.

## Governance Lifecycle

```
[Proposal Created]
       │
       ▼
[Discussion & Feedback]
       │
       ▼
[Voting Window]
       │
       ├───────────────┐
       ▼               ▼
   [Approved]      [Rejected]
       │
       ▼
[Database Record]
```

### 1. Proposals
Any active member of a Village can draft a proposal. Common proposals include:
- Allocating funds from the Village treasury to a project.
- Modifying the Village guidelines or membership criteria.
- Electing or rotating moderation/admin roles.

### 2. Discussion & Consensus
Before voting, proposals undergo a discussion phase where community members can provide feedback. This ensures that proposals are refined and reflect the community's collective needs.

### 3. Voting Mechanics
Voting power can be calculated in multiple ways depending on the Village configuration:
- **One Member, One Vote**: Democratic model promoting equal say.
- **Reputation-Weighted Voting**: Voting power is scaled based on the user's past contributions to the Village, verified through the Graph Database.
- **Token-Weighted (ADA/Asset)**: Weight based on support of the Village's native treasury.
