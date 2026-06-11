import { runWrite } from "./shared";
import crypto from 'crypto';

export const dbService = {

    async enforceConstraints() {
        await runWrite(`
            // Ensure unique lookups for fast index operations
            CREATE CONSTRAINT unique_user_id IF NOT EXISTS FOR (u:Mosaic_User) REQUIRE u.id IS UNIQUE;
            CREATE CONSTRAINT unique_community_id IF NOT EXISTS FOR (c:Mosaic_Community) REQUIRE c.id IS UNIQUE;
            CREATE CONSTRAINT unique_project_id IF NOT EXISTS FOR (p:Mosaic_Project) REQUIRE p.id IS UNIQUE;
            CREATE CONSTRAINT unique_artifact_id IF NOT EXISTS FOR (a:Mosaic_Piece) REQUIRE a.id IS UNIQUE;
            CREATE CONSTRAINT unique_skill_name IF NOT EXISTS FOR (s:Mosaic_Skill) REQUIRE s.name IS UNIQUE;
            CREATE CONSTRAINT unique_topic_name IF NOT EXISTS FOR (t:Mosaic_Topic) REQUIRE t.name IS UNIQUE;

            // Create Lookup Indexes for performance during rapid social searches
            CREATE INDEX user_username_idx IF NOT EXISTS FOR (u:Mosaic_User) ON (u.username);
            CREATE INDEX artifact_type_idx IF NOT EXISTS FOR (a:Mosaic_Piece) ON (a.type);
        `, {}, () => null);
    },

    // Seed a small set of public villages (communities) for local/dev environments.
    // This operation is idempotent: we MERGE by `slug` and only set `id` on create.
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