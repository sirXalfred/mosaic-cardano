# Cardano Blockchain Integration

Mosaic leverages the **Cardano** blockchain to connect digital identity, secure subscriptions, and verify community contributions. This integration bridges database speed with blockchain verification.

## Core Web3 Features

### 1. Cryptographic Authentication
Instead of traditional passwords, users can securely sign in using their Cardano wallet (e.g., Vespr, Eternl, Nami, Flint).
- **Nonce Flow**: The Mosaic server generates a unique, one-time cryptographic nonce.
- **Signature Verification**: The frontend requests the user's wallet to sign this nonce. The backend validates the signature using the `MeshSDK` before starting an active session.

### 2. MeshSDK Integration
We utilize `MeshSDK` for modular interactions with the Cardano network. To keep the initial page load sizes small, we dynamically import and lazy-load all Web3 operations.

### 3. Treasury & Support
Villages can configure their Cardano address to receive subscription payments, donations, or support.
- **Metadata Association**: Payments sent on-chain contain metadata referencing the `userId` and `villageId`.
- **Payment Hooks**: Our payment service scans the blockchain to verify metadata, automatically upgrading the user's subscription tier on the platform.

## Minting Badges & Credentials
Villages can issue Proof of Activity badges as native tokens or metadata-anchored tokens.
- **Verification**: Tokens represent verifiable badges, certifying that a user participated in a project or contributed to a collaborative project.
- **On-chain Reputation**: By storing these badges in your Cardano wallet, you carry your reputation across the entire ecosystem—independent of any single database.
