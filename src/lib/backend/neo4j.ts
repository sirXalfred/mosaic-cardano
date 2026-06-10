import neo4j, { Driver } from 'neo4j-driver';

const URI = process.env.NEO4J_URI || 'bolt://localhost:7687';
const USER = process.env.NEO4J_USERNAME || '';
const PASSWORD = process.env.NEO4J_PASSWORD || '';

interface GlobalNeo4j {
  neo4jDriver?: Driver;
}

const globalForNeo4j = global as typeof globalThis & GlobalNeo4j;

export const driver =
  globalForNeo4j.neo4jDriver ||
  neo4j.driver(URI, neo4j.auth.basic(USER, PASSWORD));

if (process.env.NODE_ENV !== 'production') {
  globalForNeo4j.neo4jDriver = driver;
}