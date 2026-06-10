import { runWrite } from "./shared";
import { driver } from "@/lib/backend/neo4j";
import crypto from 'crypto';

export const dbService = {

    async enforceConstraints() {
        // Enforcing Memgraph specific constraints and indexes
        // Memgraph does not natively support IF NOT EXISTS in all environments for constraints without erroring,
        // and uses the ASSERT ... IS UNIQUE syntax.
        // It also does not support named constraints in this context natively.
        // Furthermore, Memgraph requires constraints to be created in implicit (auto-committing) transactions.
        const stmts = [
            `CREATE CONSTRAINT ON (u:Mosaic_User) ASSERT u.id IS UNIQUE;`,
            `CREATE CONSTRAINT ON (c:Mosaic_Community) ASSERT c.id IS UNIQUE;`,
            `CREATE CONSTRAINT ON (p:Mosaic_Project) ASSERT p.id IS UNIQUE;`,
            `CREATE CONSTRAINT ON (a:Mosaic_Piece) ASSERT a.id IS UNIQUE;`,
            `CREATE CONSTRAINT ON (s:Mosaic_Skill) ASSERT s.name IS UNIQUE;`,
            `CREATE CONSTRAINT ON (t:Mosaic_Topic) ASSERT t.name IS UNIQUE;`,
            `CREATE INDEX ON :Mosaic_User(username);`,
            `CREATE INDEX ON :Mosaic_Piece(type);`
        ];

        const session = driver.session();
        try {
            for (const stmt of stmts) {
                try {
                    await session.run(stmt);
                } catch (error) {
                    // We catch the error to simulate "IF NOT EXISTS"
                    if (!(error as Error).message?.includes('already exists')) {
                        console.error('Error enforcing constraint/index:', error);
                    }
                }
            }
        } finally {
            await session.close();
        }
    },

    // Seed a small set of public villages (communities) for local/dev environments.
    // This operation is idempotent: we MERGE by \`slug\` and only set \`id\` on create.
    async seedVillages() {
        const now = Date.now();
        const base = [
            { slug: 'arts-and-stories', name: 'Arts & Stories', description: 'A village for storytellers and visual artists.' },
            { slug: 'open-source-collab', name: 'Open Source Collab', description: 'Builders collaborating on open infrastructure.' },
            { slug: 'sound-experiments', name: 'Sound Experiments', description: 'Experimental audio and field recordings.' },
            { slug: 'urban-gardens', name: 'Urban Gardens', description: 'Community gardens and local ecology projects.' },
            { slug: 'film-makers-hub', name: 'Filmmakers Hub', description: 'Independent film and short-form creators.' },
            { slug: 'crafts-and-making', name: 'Crafts & Making', description: 'Hands-on making, craft, and material practice.' },
            { slug: 'poetry-circles', name: 'Poetry Circles', description: 'Poets, spoken word and small-press collaborators.' },
            { slug: 'research-practices', name: 'Research Practices', description: 'Practice-led research and methods exchange.' },
            { slug: 'audio-visual-labs', name: 'Audio Visual Labs', description: 'Collaborations across sound and moving image.' },
            { slug: 'digital-traditions', name: 'Digital Traditions', description: 'Exploring cultural practices through code.' },

            // 10 more villages
            { slug: 'makers-collective', name: 'Makers Collective', description: 'Tooling, workshops and prototyping community.' },
            { slug: 'local-history', name: 'Local History', description: 'Documenting and archiving local stories.' },
            { slug: 'food-innovators', name: 'Food Innovators', description: 'Experimental kitchens and food systems.' },
            { slug: 'eco-tech', name: 'Eco Tech', description: 'Sustainable technology and environmental action.' },
            { slug: 'design-systems', name: 'Design Systems', description: 'Designers and pattern libraries.' },
            { slug: 'education-labs', name: 'Education Labs', description: 'Alternative pedagogies and learning projects.' },
            { slug: 'photography-club', name: 'Photography Club', description: 'Image-making and critique groups.' },
            { slug: 'textile-studio', name: 'Textile Studio', description: 'Weaving, textiles and material experiments.' },
            { slug: 'data-visualisation', name: 'Data Visualisation', description: 'Storytelling with data and visualization.' },
            { slug: 'performance-art', name: 'Performance Art', description: 'Live practice, performance and durational work.' },
        ];

        const villages = base.map(v => ({ id: crypto.randomUUID(), slug: v.slug, name: v.name, description: v.description, createdAt: now }));

        await runWrite(
            `
                UNWIND $villages AS v
                MERGE (c:Mosaic_Community {slug: v.slug})
                ON CREATE SET c.id = v.id, c.name = v.name, c.description = v.description, c.createdAt = v.createdAt
                RETURN count(c) AS created
            `,
            { villages },
            row => row.created,
        );
    },

    // Initialize DB: enforce constraints and optionally seed sample villages.
    async init({ seed = true } = {}) {
        await this.enforceConstraints();
        if (seed) {
            await this.seedVillages();
        }
    }
}
