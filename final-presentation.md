# Mosaic: Final Presentation

## Piece of Pie Hackathon by Gimbalabs

---

## Slide 1: Title

- **Project name:** Mosaic
- **Team:** David Uwagbale, Alfred Itodole
- **Presenter name:** David Uwagbale
- **Tracks pursued:**
  - Cardano Pie
  - Feedback Pie

---
village
## Slide 2: Project Identity

- **Project name:** Mosaic
- **One-sentence description:** A collaborative platform for creative communities where members can co-author publications, securely split treasury rewards, and permanently anchor their contribution histories and on-chain reputation to the Cardano blockchain.
- **Official public repository:** [github.com/sirXalfred/mosaic-cardano](https://github.com/sirXalfred/mosaic-cardano)
- **Deployed public product:** [Mosaic Webapp](https://mosaic-cardano-production-e6ae.up.railway.app)
- **Official project X account:** [@DavidTimi_1](https://x.com/DavidTimi_1)
- **Primary X posting account (weekly updates):** [@DavidTimi_1](https://x.com/DavidTimi_1)
- **Team members as registered:** David Uwagbale, Alfred Itodole

---

## Slide 3: What the Product Does

**Who the user is**

Creative communities, social groups and explorer groups who collaborate on shared publications and community activities but lack a unified place to split value, track contribution history, and establish credit for their work.

**What the user can do**

- **Create a Community (Mosaic Village):** Launch a dedicated home/workspace for their community.
- **Studio Editor:** Draft and co-author content collaboratively in a real-time Markdown editor.
- **Configure Splits:** Define contribution weights and roles (e.g., 60% Writer, 40% Editor) for co-authored pieces.
- **Cryptographic Signatures:** Co-authors sign off on the proposed splits directly using their Cardano wallets (via CIP-8 signatures).
- **Decentralized Publishing:** Permanently publish frozen work on IPFS and anchor co-authorship metadata directly to the Cardano blockchain.
- **Treasury Subscription:** Communities can upgrade their plans using ADA subscription payments.

**What value the user gets**

- **Immutable Attribution:** Contributors have cryptographic proof of their authorship, roles, and ownership weight.
- **Decentralized Archive:** Community publications are stored permanently on IPFS, removing reliance on centralized database servers.
- **On-chain Reputation:** Every contribution builds a verifiable on-chain record and history of participation.
- **Treasury Split Safety:** Future subscription earnings or bounties from the community treasury can be split automatically and trustlessly based on on-chain co-authorship records.

**Where payment/gating happens**

- **Subscription Payments:** Users pay in ADA to unlock higher tiers (Basic or Pro) for their communities.
- **Contribution Splits:** Define future bounty and revenue-sharing allocations directly during the publishing stage.

---

## Slide 4: Live Demo

Demo flow:

1. **Landing & Onboarding:** Visit [Mosaic Webapp](https://mosaic-cardano-production-e6ae.up.railway.app), view the community library, and sign in by connecting your Cardano wallet (Nami, Eternl, etc.) using cryptographic signatures (no passwords).
2. **Community Workspace:** Enter a Community, open the Studio editor, and show members collaborating on a draft.
3. **Initiating Publishing:** Freeze the document content, which uploads the raw text to IPFS, and propose co-authorship splits (e.g. 70% Timi as Writer, 30% Collaborator as Editor).
4. **Co-author Signatures:** Switch to the collaborator's view. See the pending signature in their Action Center, click "Sign Contribution," and sign via their wallet (CIP-8 signature verification).
5. **Decentralized Publishing & Cardano Anchor:** Once all signatures are verified, click "Publish & Mint." The app wallet builds a metadata anchoring transaction (Label `2026` representing `MosaicContribution`) containing the IPFS manifest CID.
6. **Verification on Explorer:** View the published piece in the Community Library, showing the dual-link display:
   - Direct link to the **IPFS Manifest** containing the co-authorship splits and raw signatures.
   - Direct link to the **Cardano Transaction** on Cardanoscan showing the metadata anchored to the ledger.
7. **User Profile & Badges:** Open the user's profile page (`/u/[username]`), displaying their dynamic portfolio of published works, contribution history, and earned badges.
8. **Plan Subscription Payment:** Go to settings, choose a tier (Basic/Pro), and trigger an ADA payment. The wallet prompts for transaction signing, sends the Lovelace to the Mosaic treasury, attaches metadata Label `674` (`"Mosaic Upgrade"`), and upgrades the account.

<!-- **Demo and final presentation video:** [TODO] -->

---

## Slide 5: How a User Buys/Subscribes

**What the user is buying:** Premium workspace capacity, unlimited members, and advanced governance features through Basic or Pro subscription plans.

**The payment flow:**

1. User opens the **Pricing/Subscription** modal or section.
2. The user selects a plan (e.g. Basic for \$8/month or Pro for \$60/month).
3. The platform fetches the live ADA/USD price and calculates the exact Lovelace amount required.
4. The user clicks "Pay with ADA", triggering a CIP-30 wallet connection prompt.
5. The wallet prompts for a signature to authorize the transfer.
6. The transaction is submitted on-chain, sending Lovelace to the Mosaic treasury address with metadata Label `674` containing the plan type and user ID.
7. The platform verifies the transaction hash on-chain, updates the database, and upgrades the user's community limits.

**Fulfillment evidence:** [View on Explorer](https://cardanoscan.io/transaction/5274c458e558bedbb69483a5c487d9de011b918ad541d046143d72c14cea684a)

---

## Slide 6: Public Repository Evidence

- **Repository URL:** [github.com/sirXalfred/mosaic-cardano](https://github.com/sirXalfred/mosaic-cardano)
- **Public:** Yes, confirmed public
- **Key structure:**
  - `src/app/`: Next.js App Router layouts, pages, and API routes.
  - `src/components/`: Modular UI design system components (Studio, Editor, Modals, Profile, Wallet).
  - `src/lib/`: Client and server utilities, including:
    - `src/lib/backend/redis.ts`: Redis client with build-phase caching optimization.
    - `src/lib/cardano/`: Cardano transactional and metadata anchoring logic using MeshSDK.
  - `src/services/`: Client-side data query and mutation hooks (Auth, Documents, Villages, Payments).

---

## Slide 7: Twelve Official Weekly Update Posts

All updates posted from [@DavidTimi_1](https://x.com/DavidTimi_1).

- **Week 1** — [View post](https://x.com/DavidTimi_1/status/2050908256088789314?s=20)
  Scaffolded the project foundations. Registered the repository, aligned the team, and finalized the Product Requirement Document (PRD).
- **Week 2** — [View post](https://x.com/DavidTimi_1/status/2053444756563226937?s=20)
  Defined core design principles, updated the public roadmap, and set up team collaboration channels.
- **Week 3** — [View post](https://x.com/DavidTimi_1/status/2055981255179592055?s=20)
  Completed user interviews with community organizers and designed wireframes for all key screens.
- **Week 4** — [View post](https://x.com/DavidTimi_1/status/2058517736452477328?s=20)
  Finalized high-fidelity designs and scaffolded the Next.js frontend structure.
- **Week 5** — [View post](https://x.com/DavidTimi_1/status/2061054933336576161?s=20)
  Built out the initial Community Workspace UI, the real-time Markdown Studio editor, and integrated the Cardano wallet connection.
- **Week 6** — [View post](https://x.com/DavidTimi_1/status/2063591510067560834?s=20)
  Implemented testnet Cardano transactions, designed the co-authorship metadata schema, and initiated the badge minting logic.
- **Week 7** — [View post](https://x.com/DavidTimi_1/status/2066128232022233338?s=20)
  Built the sys-admin dashboard with live blockfrost treasury tracking, set up role-based access control, and integrated the Swagger API documentation framework.
- **Week 8** — [View post](https://x.com/DavidTimi_1/status/2068665138886901860?s=20)
  Migrated Studio to a server-first architecture, built the user Action Center with the pending signatures tracker, and added document comments.
- **Week 9** — [View post](https://x.com/DavidTimi_1/status/2071201709511336246?s=20)
  Separated public/authenticated layouts, transitioned terminology to "Communities", and implemented the dynamic activity feed.
- **Week 10** — [View post](https://x.com/DavidTimi_1/status/2073738302859977074?s=20)
  Integrated the automated publishing modal trigger, dynamic signature display, and markdown documentation framework.
- **Week 11** — [View post](https://x.com/DavidTimi_1/status/2076275378239226062?s=20)
  Enabled single-contributor direct publishing, view-only studio mode, and added dual-link displays for IPFS manifests and Cardanoscan.
- **Week 12** — [View post](https://x.com/DavidTimi_1/status/2078739245888360760?s=20)
  Finalized build-phase caching optimization, resolved Redis DNS resolution conflicts for production deployment, and optimized responsive mobile modal interfaces.

---

<br /> <br />

# Cardano Pie Evidence

## Builder Pie Summary

- **Live demo completed:** Yes, [Mosaic Webapp](https://mosaic-cardano-production-e6ae.up.railway.app)
- **Official public repository shown:** Yes, [github.com/sirXalfred/mosaic-cardano](https://github.com/sirXalfred/mosaic-cardano)
- **Deployed public product link shown:** Yes, [Mosaic Webapp](https://mosaic-cardano-production-e6ae.up.railway.app)
- **All 12 official weekly update posts linked:** Yes (referenced above)
- **Public evidence verifiable:** Yes, all published pieces show on-chain metadata anchoring transaction IDs and IPFS manifest hashes directly in the library.

## Cardano Slide A: On-Chain Functionality

**Real Cardano Mainnet / Testnet Functionality**

1. **Decentralized Co-authorship Metadata Anchoring:**
   When a collaborative piece is published, a manifest containing all authors, roles, and signature proofs is generated and uploaded to IPFS. This IPFS manifest CID is then anchored directly to the Cardano blockchain in a transaction metadata payload under Label `2026`.
   - **Anchoring Tx Hash:** `ca3fa040aa37dc16230326ade15f1b9a78a6aa17b1af3edb70716da7d3180240` [View in Explorer](https://cardanoscan.io/transaction/ca3fa040aa37dc16230326ade15f1b9a78a6aa17b1af3edb70716da7d3180240?tab=metadata)
   - **IPFS Manifest URI:** `ipfs://bafkreihxmdjyxibawxjzalr4b3xqbecz47p4br6ddbdlu34ohq2duhjyna`
2. **ADA Plan Subscription Payments:**
   Users pay in ADA to upgrade their subscription plans. The app calculates the ADA/USD rate, prompts the wallet signature, transfers Lovelace to the treasury address, and attaches metadata Label `674`.
   - **Subscription Tx Hash:** `[View on Explorer](https://cardanoscan.io/transaction/5274c458e558bedbb69483a5c487d9de011b918ad541d046143d72c14cea684a)`
3. **Wallet-native Authentication (CIP-8):**
   Login and authentication are handled entirely without passwords by signing a cryptographic payload through the connected Cardano wallet.
4. **App Wallet Treasury Management:**
   Uses a dedicated backend App Wallet to automate transaction anchoring, with automated Resend alerts triggered when the treasury balance falls below 10 ADA.

---

# Feedback Pie Evidence

Detailed feedback sessions and platform critiques are archived in the [Mosaic Feedback Document](https://docs.google.com/document/d/1fNMfBijtdq8ATEdSJuYiUdoFU0tIJsNH0bWPaT5LC2k/edit?usp=sharing).

## Feedback Slide A: Recorded Session Evidence


### Session 1

- **Product name (that you gave feedback to):** Mosaic (Collaborative Village & Publishing Platform)
- **Recorded session link:** [Mosaic Feedback Session and Live Beta Test - 2026/07/09 14:56 WAT - Recording](https://drive.google.com/file/d/1wjuAFVh93jKglC_TnpPKLX8FLVO-2ZH-/view)
- **Session date:** 09-07-2026
- **Participants:** David Uwagbale (Feedback Taker), Harsha Gullapali (@gZero) (Tester)
- **Duration:** 30 mins
- **Why this session counts:** 
  The session gathered deep usability feedback on community setup. The tester appreciated the "GitHub for communities" concept but highlighted terminology friction (e.g. 'village', 'settlement', 'pieces') causing confusion for newcomers. 
  - **High-Severity Bug:** Signing modal fails to close automatically after completion.
  - **Mid-Severity Bug:** Occasional 500 errors on draft creation and contribution weight assignment.

### Session 2

- **Product name (that you gave feedback to):** Mosaic (Collaborative Village & Publishing Platform)
- **Recorded session link:** [Abdulazeez Review of Mosaic.mp4](https://drive.google.com/file/d/1cZvcKJxv7QBA784mCz9N4UQVpHiwuOuq/view)
- **Session date:** 11-07-2026
- **Participants:** David Uwagbale (Feedback Taker), Fola (Abdulazeez) (Tester)
- **Duration:** 20 mins
- **Why this session counts:**
  Focused on validating collaboration invitation and signing UX flows. The tester praised the robust wallet mismatch error handling but highlighted friction in the manual signing modal workflow and missing collaborator autocomplete search.
  - **High-Severity Bug:** Manual modal closure required to complete the signing process.
  - **Mid-Severity Bug:** Occasional dashboard loading issues.

**Summary of all sessions:**

- **Total completed recorded sessions:** 2 (History kept in [Mosaic Feedback Document](https://docs.google.com/document/d/1fNMfBijtdq8ATEdSJuYiUdoFU0tIJsNH0bWPaT5LC2k/edit?tab=t.0))

---

<br /> <br />

# One-Slide Summary

- **Project name:** Mosaic
- **Repo:** [github.com/sirXalfred/mosaic-cardano](https://github.com/sirXalfred/mosaic-cardano)
- **Live product:** [Mosaic Webapp](https://mosaic-cardano-production-e6ae.up.railway.app)
- **Demo and presentation video:** `[Video](https://drive.google.com/file/d/1LMI3c5KamK7TuhGjcmH0A438y2lEmvqQ/view?usp=drive_link)`
- **X account:** [@DavidTimi_1](https://x.com/DavidTimi_1)

**Weekly update posts:**

- [Week 1](https://x.com/DavidTimi_1/status/2050908256088789314?s=20) · [Week 2](https://x.com/DavidTimi_1/status/2053444756563226937?s=20) · [Week 3](https://x.com/DavidTimi_1/status/2055981255179592055?s=20) · [Week 4](https://x.com/DavidTimi_1/status/2058517736452477328?s=20)
- [Week 5](https://x.com/DavidTimi_1/status/2061054933336576161?s=20) · [Week 6](https://x.com/DavidTimi_1/status/2063591510067560834?s=20) · [Week 7](https://x.com/DavidTimi_1/status/2066128232022233338?s=20) · [Week 8](https://x.com/DavidTimi_1/status/2068665138886901860?s=20)
- [Week 9](https://x.com/DavidTimi_1/status/2071201709511336246?s=20) · [Week 10](https://x.com/DavidTimi_1/status/2073738302859977074?s=20) · [Week 11](https://x.com/DavidTimi_1/status/2076275378239226062?s=20) · [Week 12](https://x.com/DavidTimi_1/status/2078739245888360760?s=20)

**Track evidences:**

- **Cardano:** Anchoring co-authorship manifests (IPFS + Metadata Label `2026`) and ADA Plan Upgrades (Metadata Label `674`).
- **Feedback:** 2 detailed recorded user feedback sessions completed (Reference: [Mosaic Feedback Document](https://docs.google.com/document/d/1fNMfBijtdq8ATEdSJuYiUdoFU0tIJsNH0bWPaT5LC2k/edit?tab=t.0)).
