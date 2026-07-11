<div align="center">

<br/>

```
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║      M  O  S  A  I  C                                            ║
║                                                                  ║
║      Every community. Every passion. One home.                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

<br/>

[![Build Status](https://img.shields.io/badge/status-building%20in%20public-blueviolet?style=for-the-badge&logo=github)](https://github.com/sirXalfred/mosaic-cardano)
[![Hackathon](https://img.shields.io/badge/Gimbalabs-Piece%20of%20Pie%202026-orange?style=for-the-badge)](https://www.gimbalabs.com/piece-of-pie)
[![Built on](https://img.shields.io/badge/Built%20on-Cardano-0033AD?style=for-the-badge&logo=cardano)](https://cardano.org)
[![Week](https://img.shields.io/badge/Week-7%20of%2012-yellow?style=for-the-badge)](#roadmap)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

*A village platform for communities of any shared interest, passion, or hobby.*
*Create together. Show up together. Earn together.*

<br/>

[✦ The Story](#-the-story) · [✦ The Problem](#-the-problem) · [✦ Who This Is For](#-who-this-is-for) · [✦ What Mosaic Does](#-what-mosaic-does) · [✦ Technical Breakdown](docs.md) · [✦ The Roadmap](#-the-roadmap) · [✦ Follow Along](#-follow-along)

</div>

---

<br/>

## ✦ A note before we begin

> This README is not a finished document. It is a living one.
>
> We are building Mosaic in public — which means you are reading this at a particular moment in our journey. Some things here are certain. Some are still evolving. Some we haven't figured out yet and we are honest about that.
>
> We will update this as we go. Come back. Watch it change. That is the point.

<br/>

---

<br/>

## ✦ The Story

It started with a simple observation.

Communities are everywhere. Book clubs that meet every month. Poetry circles that perform together and never publish anywhere. Hiking groups that document trails no one else has walked. Music collectives where eight people create one sound and one person owns the account. Writing groups where contributions vanish into a WhatsApp chat scroll and are never seen again.

These communities are real. They are warm, generous, creative, and alive. And yet — they have no proper home. Their work is scattered. Their contributors go unrecognised. Their history disappears. And when money does come in, it goes to one person, not to the village that built it.

We kept asking: *why does a tool like this not exist?*

GitHub gives developers version control, contribution history, and a home for collaborative code. Patreon gives individual creators a way to earn. Substack gives writers an audience. Discord gives communities a chat room. But none of these give a community — any community, not just developers, not just solo creators — a real home where they can create together, protect what they build, show up for each other, earn fairly, and be seen by the world.

That is what Mosaic is trying to be.

Not a blockchain app. Not a creator monetisation platform. Not a social network.

A **village**.

A place where communities of any shared passion — book lovers, poets, hikers, musicians, filmmakers, food writers, philosophy circles, cultural preservation groups, diaspora communities, makers, explorers — can finally have one home that is built for *them*, not for advertisers, not for algorithms, and not for the platform's growth metrics.

<br/>

---

<br/>

## ✦ The Problem

We did not start with the technology. We started with people.

We talked to community founders. We listened to contributors who had been creating for years with nothing to show. We heard from book club organisers who lose every discussion to a chat scroll. From poets who perform at open mics and have no proof they were ever there. From hiking group leaders who document trails that disappear when their phone breaks.

Here is what they told us, in their own words:

<br/>

> *"Our reviews disappear into WhatsApp. We've been meeting for three years and have nothing permanent to show for it."*
> — Book club organiser

> *"I contribute to the newsletter every month. One person earns. The rest of us just... contribute."*
> — Writer

> *"We are eight musicians. We split revenue over bank transfers. Someone always feels they didn't get their fair share."*
> — Music band founder

<br/>

These are not edge cases. These are the default conditions for creative and community life everywhere — and especially across Africa, where the creative ecosystem is growing faster than anywhere else in the world, yet the tools to support it simply do not exist.

**The five things we believe are broken:**

| Problem | What it costs communities |
|---|---|
| No shared home | Communities live across 5 apps simultaneously. Knowledge is fragmented. History disappears. |
| Unpaid collaboration | When multiple people contribute, one account earns. Everyone else contributes for free. |
| No proof of participation | There is no verifiable record of showing up, contributing, or completing creative work. |
| Gatekeeping | Algorithms, platforms, and institutions decide who gets seen. Communities are filtered out. |
| Invisible value | The cultural, social, and human value communities generate is never measured or rewarded. |

<br/>

---

<br/>

## ✦ Who This Is For

Mosaic serves any group of people working together toward a shared passion:

### 🎭 Creative Collectives
Writers, poets, musicians, designers, filmmakers, and publishing collectives.

### 🥾 Explorer Groups
Hikers, urban explorers, nature documenters, and conservation groups.

### 🌍 Cultural Communities
Study groups, debate societies, diaspora communities, and oral historians.

### 🏗️ Makers and Builders
Hardware makers, open-source developers, and craft circles.

<br/>

---

<br/>

## ✦ What Mosaic Does

*Note: This is where our thinking currently sits. Features will evolve based on what real communities tell us they need. We are building iteratively, not from a fixed list.*

<br/>

### 🏡 The Village — Community Home
Every community on Mosaic gets a unified, permanent home. Not a chat room. Not a folder of documents. A real workspace where everything lives together: collaborative work, community discussions, events, operational records, history, and governance. The community owns what it builds. Nothing gets lost when someone changes their phone or a platform shuts down.

### ✍️ The Studio
A real-time collaborative space where members can draft, review, and publish shared work (articles, anthologies, research, etc.). All contributors are tracked and attributed.

### 🏆 Community Challenges
Organizers can run challenges (e.g., 30 poems in 30 days) with deadlines, submissions, and completion badges to keep engagement high.

### 💰 Bounties & Tasks
Communities can post funded tasks using their shared treasury. Members can claim and complete tasks to earn rewards directly to their Cardano wallets.

### 🔗 Verifiable Attribution
When a community finishes collaborative work, Mosaic ensures transparent attribution for every member involved. 

### ⛓️ Built on Cardano
We leverage Cardano for trustless revenue distribution, verifiable proof of creative participation, and immutable proof of authorship. We use MeshSDK to seamlessly connect wallets and handle transactions, ensuring the blockchain works quietly in the background.

<br/>

---

<br/>

## ✦ The Economic Layer

One of the things we are most deliberately thinking about is how value flows on Mosaic — and how to make sure it flows *to* communities rather than *away* from them.

Our current thinking:

```
Audience/supporters
      │
      │ subscribe in ADA
      ▼
Community Treasury (Cardano integration)
      │
      ├─── 10% → Protected Creator Pool (reserved for new/emerging members)
      │
      ├─── 85% → Contributors (split proportionally by verified contribution)
      │
      └─── 5%  → Mosaic platform fee
```

This ensures everyone who contributes receives their fair share, managed securely via Cardano's robust infrastructure.
The 10% protected pool is something we feel strongly about. New communities need space for new voices. Established members should not capture all the value just because they have more badges. A percentage of every treasury is reserved for the people who are just beginning.

*These numbers are not final. We will adjust based on what communities actually need.*

<br/>

---

<br/>

## ✦ The Technology Layer

*This section will be expanded by our technical lead. What follows is the non-technical overview.*

Mosaic uses Cardano as its financial and IP infrastructure layer. This means:

- Community treasuries and revenue splitting are handled by smart contracts — automatic, transparent, trustless
- Proof of Activity badges are Cardano native tokens — minted to members' wallets when they complete verified creative acts
- Copyright registration is done by anchoring a fingerprint of a work to the Cardano blockchain — immutable proof of who created what, and when

The rest of the platform is a web application — fast, mobile-first, and designed to work on mid-range devices with 4G connections, because most of our users are in Africa.

*Technical architecture, stack, and implementation details live in [`docs.md`](./docs.md) — maintained by our technical lead.*

<br/>

---

<br/>

## ✦ What We Believe (and are still questioning)

We think it is important to be honest about what we know, what we are assuming, and what we are still figuring out.

<br/>

**Things we are fairly confident about:**
- Communities everywhere are underserved by existing platforms
- Multi-contributor creative work is the norm, not the exception — and current tools treat it as an edge case
- Africa's creator ecosystem is the fastest-growing in the world and the most underserved by existing infrastructure
- Cardano's infrastructure is genuinely suited to this problem — not forced onto it

**Things we are still testing:**
- Whether communities are willing to use a Cardano wallet to receive earnings (we think friction here is real and solvable)
- Which community types will adopt earliest and most enthusiastically
- Whether the Explore/Feed public layer is enough to attract outside subscribers without an algorithm
- How much the cross-posting feature matters versus a fully Mosaic-native audience

**Things we do not yet know:**
- The exact pricing that feels fair across different community sizes and regions
- How governance will work at scale without being gamed
- The precise form the multi-value signal display should take
- How communities in different cultural contexts will want to use the treasury

*These open questions are features, not bugs. They are where the real product discovery happens.*

<br/>

---

<br/>

## ✦ The Roadmap

*We are currently in Week 7 of 12 for the Gimbalabs Piece of Pie Hackathon. This roadmap reflects our plan at this moment — it will change, and we will document those changes here.*

<br/>

```
WEEK 1  ████████████████████  ✓ DONE
        Foundations
        └── Project registered · Repo created · Team aligned
            PRD written · Vision finalised · Week 1 tweet posted

WEEK 2  ████████████████████  ✓ DONE
        Ideation & Design Principles
        └── Finalising design philosophy · README updated
            Design principles being agreed · Team discussions ongoing

WEEK 3  ████████████████████  ✓ DONE
        Design Begins
        └── Wireframes for all key screens
            User interviews with 2 community founders
            Design system foundations

WEEK 4  ████████████████████  ✓ DONE
        Design Complete + Development Starts
        └── Hi-fi designs complete
            Frontend scaffolding begins
            First design handoff to engineering

WEEK 5  ████████████████████  ✓ DONE
        Frontend Build
        └── Community workspace
            Creative studio (editor)
            Cardano wallet connect

WEEK 6  ████████████████████  NOW
        Backend Build
        └── Cardano smart contracts (testnet)
            Badge minting flow
            ADA subscription and payout logic

WEEK 7  ████████████████████  UPCOMING
          Beta Testing
        └── First real community onboarded
            Bug fixing and friction removal
            Pilot community feedback collected

WEEK 8  ░░░░░░░░░░░░░░░░░░░░  UPCOMING
        Mainnet Deployment
        └── Cardano mainnet launch
            Cross-posting integrations live
            Multi-value signals live

WEEK 9  ░░░░░░░░░░░░░░░░░░░░  UPCOMING
        User Onboarding
        └── First paying subscriber
            First ADA payout to real contributors
            Community onboarding flow refined

WEEK 10 ░░░░░░░░░░░░░░░░░░░░  UPCOMING
        Polish & Community Building
        └── Creative Passport live
            Explore page and Activity Feed complete
            Feedback to other hackathon teams

WEEK 11 ░░░░░░░░░░░░░░░░░░░░  UPCOMING
        Final Preparation
        └── All features stable
            Demo video produced
            Submission evidence compiled

WEEK 12 ░░░░░░░░░░░░░░░░░░░░  UPCOMING
        Submission & What's Next
        └── Gimbalabs submission
            Phase 2 planning begins
            The village opens its doors
```

<br/>

---

<br/>

## ✦ The Team

We are a small team building in public. Our roles are roughly:

| Role | Focus |
|---|---|
| **Product Manager** | Vision, user needs, strategy, community relationships, building in public |
| **Technical Lead** | Architecture, Cardano smart contracts, backend, infrastructure |
| **Frontend** | UI, user experience, design implementation |
| **Designer** | Visual identity, design system, interaction design |

*We are early. The team is growing. If you resonate with what we are building, reach out.*

<br/>

---

<br/>

## ✦ The Bigger Picture

We want to be honest about something.

The hackathon is 12 weeks. But Mosaic is not a 12-week project.

What we are trying to build — infrastructure for community creative life that is fair, permanent, and human-centered — takes longer than 12 weeks. The hackathon is where we build the first tile. The mosaic is much larger than that.

We believe the creative ecosystem — particularly in Africa — is at an inflection point. The tools are not there yet. The platforms that exist were not built for communities like ours. The financial infrastructure that should reward everyone who contributes simply does not exist in accessible form.

We are trying to change that. Not all at once. Not perfectly from the beginning. But with intention, with real users, and with a deep respect for the communities we are building for.

**The values we are trying to build into the product itself:**

- *Non-extractive* — Mosaic earns when communities earn. The platform does not grow by taking from the people who use it
- *Non-hegemonic* — No single cultural perspective dominates. This is built for the world, not for one part of it
- *Human-first* — The technology is infrastructure. The people are the product
- *Evidence-based* — We build what communities actually need, not what we assume they need
- *Long-arc* — Decisions are made with the next decade in mind, not the next sprint

<br/>

---

<br/>

## ✦ Follow Along

This is a public build. Everything we are doing, we are doing in the open.

<br/>

| Where | What you'll find |
|---|---|
| **This README** | The story, the vision, and the roadmap — updated weekly |
| **[docs.md](./docs.md)** | Technical documentation, architecture decisions, and engineering notes |
| **[Issues](https://github.com/sirXalfred/mosaic-cardano/issues)** | Feature discussions, bugs, and open questions |
| **[X / Twitter](https://x.com/DavidTimi_1)** | Weekly build updates — every Sunday |
| **[Gimbalabs Discord](https://discord.gg/jJcwaqJHPV)** | Hackathon community, feedback, and conversation |

<br/>

> We post a weekly update every Sunday throughout the hackathon.
> If you want to follow the build, watch this repo or follow us on X.
> If you have thoughts, questions, or you run a community that this speaks to — open an issue or reach out directly.
> We are genuinely building this with the community, not just for it.

<br/>

---

<br/>

## ✦ Contributing

We are not open for external code contributions yet — we are too early in the build. But there are meaningful ways to contribute right now:

- **Tell us about your community.** What tools do you use? What breaks? What do you wish existed? Open an issue or DM us.
- **Be a beta tester.** We are looking for real communities to onboard in Week 7. If yours might be a fit, reach out.
- **Share this.** If Mosaic resonates with you, share it with a community founder who might need it.
- **Give feedback.** On the vision, the README, the direction — open an issue. We read everything.

<br/>

---

<br/>

## ✦ A Final Word

> We are at the beginning.
>
> The idea is clear. The problem is real. The people we are building for are specific and known to us.
>
> Everything else — the design, the code, the smart contracts, the exact shape of the features — is still being built. And we are building it in public, which means you are watching it become what it is going to be.
>
> We do not think that is a weakness. We think it is the point.
>
> Come with us.

<br/>

---

<br/>

<div align="center">

**Mosaic** · Built with intention · Powered by Cardano · Made for communities

*Part of the [Gimbalabs Piece of Pie Hackathon 2026](https://www.gimbalabs.com/piece-of-pie)*

<br/>

[![GitHub](https://img.shields.io/badge/github-sirXalfred%2Fmosaic--cardano-black?style=flat-square&logo=github)](https://github.com/sirXalfred/mosaic-cardano)
[![Cardano](https://img.shields.io/badge/cardano-mainnet-0033AD?style=flat-square)](https://cardano.org)

<br/>

*Last updated: Week 7 · June 2026*

</div>
