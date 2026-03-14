const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || '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';
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || 'text-embedding-3-large';

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'NexusRAG',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate embedding');
    }

    const data = await response.json();
    return data.data[0].embedding;
  } catch (error) {
    console.error('Embedding generation error:', error);
    throw error;
  }
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'NexusRAG',
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: texts,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate embeddings');
    }

    const data = await response.json();
    return data.data.map((item: { embedding: number[] }) => item.embedding);
  } catch (error) {
    console.error('Batch embedding generation error:', error);
    throw error;
  }
}

export const EMBEDDING_DIMENSION = 3072;
