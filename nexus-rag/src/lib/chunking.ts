export interface Chunk {
  content: string;
  metadata: {
    index: number;
    page?: number;
    section?: string;
    headings?: string[];
  };
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}

const DEFAULT_SEPARATORS = [
  '\n\n\n',
  '\n\n',
  '\n',
  '. ',
  '! ',
  '? ',
  '; ',
  ', ',
  ' ',
];

export function chunkText(
  text: string,
  options: ChunkOptions = {}
): Chunk[] {
  const {
    chunkSize = 512,
    chunkOverlap = 50,
    separators = DEFAULT_SEPARATORS,
  } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const chunks: Chunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex >= text.length) {
      endIndex = text.length;
    } else {
      for (const separator of separators) {
        const separatorIndex = text.lastIndexOf(separator, endIndex);
        if (separatorIndex > startIndex) {
          endIndex = separatorIndex + separator.length;
          break;
        }
      }
    }

    let chunkContent = text.slice(startIndex, endIndex).trim();

    if (chunkContent) {
      const headings = extractHeadings(chunkContent);
      const section = extractSection(chunkContent);

      chunks.push({
        content: chunkContent,
        metadata: {
          index: chunkIndex,
          headings: headings.length > 0 ? headings : undefined,
          section: section || undefined,
        },
      });

      chunkIndex++;
    }

    const overlapStart = endIndex - chunkOverlap;
    if (overlapStart < startIndex + 1) {
      startIndex = endIndex;
    } else {
      startIndex = overlapStart;
    }
  }

  return chunks;
}

function extractHeadings(text: string): string[] {
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  const headings: string[] = [];
  let match;

  while ((match = headingRegex.exec(text)) !== null) {
    headings.push(match[1].trim());
  }

  return headings;
}

function extractSection(text: string): string | null {
  const lines = text.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) {
      return trimmed.replace(/^#+\s+/, '').trim();
    }
  }

  return null;
}

export function semanticChunkText(
  text: string,
  embeddings: number[][],
  options: ChunkOptions = {}
): Chunk[] {
  const { chunkSize = 512 } = options;
  
  const sentences = splitIntoSentences(text);
  if (sentences.length <= 1) {
    return chunkText(text, options);
  }

  const chunks: Chunk[] = [];
  let currentChunk = '';
  let currentChunkStart = 0;
  let chunkIndex = 0;

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { index: chunkIndex },
      });
      
      chunkIndex++;
      currentChunk = sentence;
      currentChunkStart = i;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: { index: chunkIndex },
    });
  }

  return chunks;
}

function splitIntoSentences(text: string): string[] {
  const sentenceEnders = /[.!?]+/g;
  const sentences: string[] = [];
  let lastEnd = 0;

  let match;
  while ((match = sentenceEnders.exec(text)) !== null) {
    const sentence = text.slice(lastEnd, match.index + match[0].length).trim();
    if (sentence) {
      sentences.push(sentence);
    }
    lastEnd = match.index + match[0].length;
  }

  const remaining = text.slice(lastEnd).trim();
  if (remaining) {
    sentences.push(remaining);
  }

  return sentences;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
