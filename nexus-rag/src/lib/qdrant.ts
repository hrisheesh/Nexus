import { QdrantClient } from '@qdrant/js-client-rest';

const qdrantUrl = process.env.QDRANT_URL || 'https://7402404c-33e1-4528-98ab-a5c954ddaf9a.us-west-2-0.aws.cloud.qdrant.io';
const qdrantApiKey = process.env.QDRANT_API_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.fY5ryswasLED2udxYPQnantTTar5f7AzY2Z7RIdaDFk';

let client: QdrantClient | null = null;

export function getQdrantClient(): QdrantClient {
  if (!client) {
    client = new QdrantClient({
      url: qdrantUrl,
      apiKey: qdrantApiKey,
    });
  }
  return client;
}

export const COLLECTIONS = {
  DEFAULT: 'nexus-documents',
  PDF: 'nexus-pdfs',
  MARKDOWN: 'nexus-markdown',
  TEXT: 'nexus-text',
  CODE: 'nexus-code',
  TABLE: 'nexus-tables',
};

export async function initializeCollections(): Promise<void> {
  const qdrant = getQdrantClient();
  const existingCollections = await qdrant.getCollections();
  const collectionNames = existingCollections.collections.map(c => c.name);

  for (const collection of Object.values(COLLECTIONS)) {
    if (!collectionNames.includes(collection)) {
      await qdrant.createCollection(collection, {
        vectors: {
          size: 3072,
          distance: 'Cosine',
        },
      });
      console.log(`Created collection: ${collection}`);
    }
  }
}

export async function getCollectionInfo(collectionName: string) {
  const qdrant = getQdrantClient();
  return await qdrant.getCollection(collectionName);
}
