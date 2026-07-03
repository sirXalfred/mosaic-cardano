import { config } from 'dotenv';
config({ path: '.env.local' });
config(); // fallback to .env

import neo4j from 'neo4j-driver';
import { createVillageProfileImage } from '../src/lib/create-village-profile-image';

const URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const USER = process.env.NEO4J_USERNAME || 'neo4j';
const PASSWORD = process.env.NEO4J_PASSWORD;

if (!PASSWORD) {
  console.error('NEO4J_PASSWORD is missing in environment');
  process.exit(1);
}

const driver = neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

(async () => {
  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });
  try {
    console.log('Fetching all communities from Neo4j...');
    
    const result = await session.executeRead(async tx => {
      const res = await tx.run(`MATCH (c:Mosaic_Community) RETURN c.id AS id, c.name AS name, c.profileImageUrl AS profileImageUrl`);
      return res.records.map(record => ({
        id: record.get('id') as string,
        name: record.get('name') as string,
        profileImageUrl: record.get('profileImageUrl') as string | null
      }));
    });

    console.log(`Found ${result.length} communities.`);

    let updatedCount = 0;

    for (const community of result) {
      if (community.profileImageUrl) {
        console.log(`Skipping [${community.name}] - already has a profile image: ${community.profileImageUrl}`);
        continue;
      }

      console.log(`Updating [${community.name}]...`);
      
      try {
        const generativeUrl = createVillageProfileImage(community.name);

        await session.executeWrite(async tx => {
          await tx.run(
            `MATCH (c:Mosaic_Community {id: $id}) SET c.profileImageUrl = $url`,
            { id: community.id, url: generativeUrl }
          );
        });

        console.log(`✅ Updated [${community.name}] with DiceBear avatar: ${generativeUrl}`);
        updatedCount++;
      } catch (err) {
        console.error(`❌ Failed to update [${community.name}]:`, (err as Error).message);
      }
    }

    console.log(`\nDone! Successfully updated ${updatedCount} communities.`);

  } catch (error) {
    console.error('Error executing script:', error);
  } finally {
    await session.close();
    await driver.close();
  }
})();
