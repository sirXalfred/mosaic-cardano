import { z } from 'zod';
import argon2 from 'argon2';

import {
	cacheAside,
	cacheKey,
	getCounter,
	incrementWithWindow,
	invalidateCacheKey,
} from '@/services/backend/cache';
import { runRead, runWrite } from '@/services/backend/shared';
import { UserNodeSchema, type UserNode } from '@/types/schemas';
import {
	LoginWithPasswordRequestSchema,
	RegisterWithPasswordRequestSchema,
	type LoginWithPasswordRequest,
	type RegisterWithPasswordRequest,
} from '@/types/api';

const UpsertUserInputSchema = z.object({
	id: z.string().uuid(),
	username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
	displayName: z.string().min(1),
	bio: z.string().max(500).optional(),
	walletAddress: z.string().optional(),
});

const UpdateProfileInputSchema = z.object({
	userId: z.string().uuid(),
	displayName: z.string().min(1).optional(),
	bio: z.string().max(500).optional(),
});


const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_FAILED_ATTEMPTS_PER_EMAIL = 8;
const MAX_FAILED_ATTEMPTS_PER_IP = 20;

type UpsertUserInput = z.infer<typeof UpsertUserInputSchema>;

const mapUserNode = (value: unknown): UserNode => {
	return UserNodeSchema.parse(value);
};

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

const emailAttemptsKey = (email: string): string => cacheKey('auth', 'login', 'email', normalizeEmail(email));
const ipAttemptsKey = (ipAddress: string): string => cacheKey('auth', 'login', 'ip', ipAddress);

const getThrottleState = async (email: string, ipAddress?: string): Promise<{ blocked: boolean; reason?: string }> => {
	const [emailCount, ipCount] = await Promise.all([
		getCounter(emailAttemptsKey(email)),
		ipAddress ? getCounter(ipAttemptsKey(ipAddress)) : Promise.resolve(0),
	]);

	if (emailCount >= MAX_FAILED_ATTEMPTS_PER_EMAIL) {
		return { blocked: true, reason: 'Too many failed attempts for this email. Try again later.' };
	}

	if (ipCount >= MAX_FAILED_ATTEMPTS_PER_IP) {
		return { blocked: true, reason: 'Too many failed attempts from this IP. Try again later.' };
	}

	return { blocked: false };
};

const recordFailedAttempt = async (email: string, ipAddress?: string): Promise<void> => {
	const ops: Array<Promise<number>> = [
		incrementWithWindow(emailAttemptsKey(email), LOGIN_WINDOW_SECONDS),
	];

	if (ipAddress) {
		ops.push(incrementWithWindow(ipAttemptsKey(ipAddress), LOGIN_WINDOW_SECONDS));
	}

	await Promise.all(ops);
};

const clearAttemptCounters = async (email: string, ipAddress?: string): Promise<void> => {
	const keys = [emailAttemptsKey(email)];
	if (ipAddress) keys.push(ipAttemptsKey(ipAddress));

	await Promise.all(keys.map(key => invalidateCacheKey(key)));
};

export const authService = {
	async registerWithPassword(input: RegisterWithPasswordRequest): Promise<UserNode> {
		const parsed = RegisterWithPasswordRequestSchema.parse(input);
		const now = Date.now();
		const userId = crypto.randomUUID();
		const credentialId = crypto.randomUUID();
		const email = normalizeEmail(parsed.email);

		const passwordHash = await argon2.hash(parsed.password, {
			type: argon2.argon2id,
			timeCost: 3,
			memoryCost: 2 ** 16,
			parallelism: 1,
		});

		const rows = await runWrite(
			`

				MERGE (cred:Mosaic_Credential {email: $email})
				ON CREATE SET
					cred.id = $credentialId,
					cred.userId = $userId,
					cred.passwordHash = $passwordHash,
					cred.provider = 'LOCAL',
					cred.createdAt = $now
				WITH cred
				WHERE cred.userId = $userId
				MERGE (u:Mosaic_User {id: $userId})
				ON CREATE SET
					u.username = $username,
					u.displayName = $displayName,
					u.isOnboarded = false,
					u.createdAt = $now
				MERGE (u)-[:HAS_CREDENTIAL]->(cred)
				RETURN u AS user
`,
			{
				email,
				credentialId,
				userId,
				passwordHash,
				username: parsed.username,
				displayName: parsed.displayName,
				now,
			},
			row => mapUserNode(row.user),
		);

		if (!rows[0]) {
			throw new Error('Email is already registered');
		}
		return rows[0];
	},

	async loginWithPassword(input: LoginWithPasswordRequest): Promise<UserNode> {
		const parsed = LoginWithPasswordRequestSchema.parse(input);
		const email = normalizeEmail(parsed.email);

		const throttle = await getThrottleState(email, parsed.ipAddress);
		if (throttle.blocked) {
			throw new Error(throttle.reason);
		}

		const rows = await runRead(
			`
				MATCH (u:Mosaic_User)-[:HAS_CREDENTIAL]->(cred:Mosaic_Credential {email: $email, provider: 'LOCAL'})
				RETURN u AS user, cred.passwordHash AS passwordHash
				LIMIT 1
			`,
			{ email },
			row => ({
				user: mapUserNode(row.user),
				passwordHash: z.string().parse(row.passwordHash),
			}),
		);

		const record = rows[0];
		if (!record) {
			await recordFailedAttempt(email, parsed.ipAddress);
			throw new Error('Invalid email or password');
		}

		const isValid = await argon2.verify(record.passwordHash, parsed.password);
		if (!isValid) {
			await recordFailedAttempt(email, parsed.ipAddress);
			throw new Error('Invalid email or password');
		}

		await clearAttemptCounters(email, parsed.ipAddress);
		await runWrite(
			`
				MATCH (:Mosaic_User {id: $userId})-[:HAS_CREDENTIAL]->(cred:Mosaic_Credential {email: $email})
				SET cred.lastLoginAt = $now, cred.updatedAt = $now
				RETURN cred.id AS credentialId
			`,
			{ userId: record.user.id, email, now: Date.now() },
			row => row.credentialId,
		);

		await invalidateCacheKey(cacheKey('user', record.user.id));
		return record.user;
	},

	async upsertUser(input: UpsertUserInput): Promise<UserNode> {
		const parsed = UpsertUserInputSchema.parse(input);
		const now = Date.now();

		const rows = await runWrite(
			`
				MERGE (u:Mosaic_User {id: $id})
				ON CREATE SET
					u.username = $username,
					u.displayName = $displayName,
					u.bio = $bio,
					u.walletAddress = $walletAddress,
					u.isOnboarded = false,
					u.createdAt = $now
				ON MATCH SET
					u.username = $username,
					u.displayName = $displayName,
					u.bio = $bio,
					u.walletAddress = $walletAddress,
					u.updatedAt = $now
				RETURN u AS user
			`,
			{
				id: parsed.id,
				username: parsed.username,
				displayName: parsed.displayName,
				bio: parsed.bio ?? null,
				walletAddress: parsed.walletAddress ?? null,
				now,
			},
			row => mapUserNode(row.user),
		);

		const user = rows[0];
		await invalidateCacheKey(cacheKey('user', user.id));
		return user;
	},

	async getUserById(userId: string): Promise<UserNode | null> {
		const parsedUserId = z.string().uuid().parse(userId);
		const key = cacheKey('user', parsedUserId);

		return cacheAside(
			key,
			async () => {
				const rows = await runRead(
					`
						MATCH (u:Mosaic_User {id: $userId})
						RETURN u AS user
						LIMIT 1
					`,
					{ userId: parsedUserId },
					row => mapUserNode(row.user),
				);

				return rows[0] ?? null;
			},
			120,
		);
	},

	async getUserByUsername(username: string): Promise<UserNode | null> {
		const rows = await runRead(
			`
				MATCH (u:Mosaic_User {username: $username})
				RETURN u AS user
				LIMIT 1
			`,
			{ username },
			row => mapUserNode(row.user),
		);

		return rows[0] ?? null;
	},

	async updateProfile(input: z.infer<typeof UpdateProfileInputSchema>): Promise<UserNode> {
		const parsed = UpdateProfileInputSchema.parse(input);
		const now = Date.now();

		const setClauses = [];
		const params: Record<string, string | number> = { userId: parsed.userId, now };

		if (parsed.displayName !== undefined) {
			setClauses.push(`u.displayName = $displayName`);
			params.displayName = parsed.displayName;
		}
		if (parsed.bio !== undefined) {
			setClauses.push(`u.bio = $bio`);
			params.bio = parsed.bio;
		}

		if (setClauses.length === 0) {
			const user = await this.getUserById(parsed.userId);
			if (!user) throw new Error('User not found');
			return user;
		}

		setClauses.push(`u.updatedAt = $now`);

		const rows = await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				SET ${setClauses.join(', ')}
				RETURN u AS user
			`,
			params,
			row => mapUserNode(row.user),
		);

		if (!rows[0]) throw new Error('User not found');
		await invalidateCacheKey(cacheKey('user', parsed.userId));
		return rows[0];
	},

	async setOnboarded(userId: string): Promise<void> {
		const parsedUserId = z.string().uuid().parse(userId);
		const now = Date.now();

		await runWrite(
			`
				MATCH (u:Mosaic_User {id: $userId})
				SET u.isOnboarded = true, u.updatedAt = $now
				RETURN u.id AS userId
			`,
			{ userId: parsedUserId, now },
			row => row.userId,
		);

		await invalidateCacheKey(cacheKey('user', parsedUserId));
	},
};

