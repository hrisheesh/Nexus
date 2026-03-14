export interface ExtractedText {
  content: string;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
    format?: string;
  };
}

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 50;

export async function extractTextFromFile(
  file: File
): Promise<ExtractedText> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  console.log('📄 [EXTRACT] File extension:', extension);
  
  switch (extension) {
    case 'pdf':
      return extractFromPDF(file);
    case 'txt':
      return extractFromTXT(file);
    case 'md':
    case 'markdown':
      return extractFromMarkdown(file);
    case 'csv':
      return extractFromCSV(file);
    case 'docx':
      return extractFromDOCX(file);
    default:
      return extractFromTXT(file);
  }
}

async function extractFromPDF(file: File): Promise<ExtractedText> {
  try {
    console.log('📄 [PDF] Starting extraction for:', file.name, 'size:', file.size);
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const { PdfReader } = await import('pdfreader');
    const reader = new PdfReader();
    
    return new Promise((resolve, reject) => {
      let fullText = '';
      let pageCount = 0;
      let currentPage = '';
      
      reader.parseBuffer(buffer, (err: any, item: any) => {
        if (err) {
          console.error('📄 [PDF] Parse error:', err);
          reject(err);
          return;
        }
        
        if (!item) {
          if (currentPage) {
            fullText += currentPage + '\n\n';
          }
          console.log('📄 [PDF] Extraction complete. Pages:', pageCount, 'Chars:', fullText.length);
          resolve({
            content: fullText.trim(),
            metadata: {
              pageCount,
              format: 'pdf',
            },
          });
          return;
        }
        
        if (item.page) {
          pageCount++;
          if (currentPage) {
            fullText += currentPage + '\n\n';
          }
          currentPage = '';
          
          if (pageCount % 10 === 0 || pageCount === 1) {
            console.log(`📄 [PDF] Processed page ${pageCount}`);
          }
        }
        
        if (item.text) {
          currentPage += item.text + ' ';
        }
      });
    });
  } catch (error) {
    console.error('📄 [PDF] Extraction error:', error);
    return {
      content: `[PDF file: ${file.name}]\n\nFailed to extract text.`,
      metadata: { format: 'pdf' },
    };
  }
}

async function extractFromTXT(file: File): Promise<ExtractedText> {
  const content = await file.text();
  const firstLine = content.split('\n')[0].trim();
  
  return {
    content,
    metadata: {
      title: firstLine.length < 100 ? firstLine : undefined,
      format: 'txt',
    },
  };
}

async function extractFromMarkdown(file: File): Promise<ExtractedText> {
  const content = await file.text();
  const lines = content.split('\n');
  
  let title: string | undefined;
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# ')) {
      title = trimmed.slice(2).trim();
      break;
    }
  }

  return {
    content,
    metadata: {
      title,
      format: 'md',
    },
  };
}

async function extractFromCSV(file: File): Promise<ExtractedText> {
  const content = await file.text();
  const lines = content.split('\n');
  
  const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
  
  let text = `CSV with columns: ${headers.join(', ')}\n\n`;
  
  for (let i = 1; i < lines.length && i <= 100; i++) {
    const values = lines[i]?.split(',').map(v => v.trim().replace(/"/g, '')) || [];
    if (values.some(v => v)) {
      text += `Row ${i}: ${values.join(' | ')}\n`;
    }
  }

  return {
    content: text,
    metadata: {
      title: file.name.replace('.csv', ''),
      format: 'csv',
    },
  };
}

async function extractFromDOCX(file: File): Promise<ExtractedText> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return {
      content: result.value,
      metadata: {
        format: 'docx',
      },
    };
  } catch (error) {
    console.error('DOCX extraction error:', error);
    return {
      content: `[DOCX file: ${file.name}]\n\nPlease upload as text file or use a PDF viewer.`,
      metadata: { format: 'docx' },
    };
  }
}

export function splitIntoChunks(
  text: string,
  options: { chunkSize?: number; chunkOverlap?: number; separators?: string[] } = {}
): string[] {
  const { chunkSize = DEFAULT_CHUNK_SIZE, chunkOverlap = DEFAULT_CHUNK_OVERLAP } = options;
  
  console.log('✂️ [CHUNK] Starting with text length:', text.length);
  console.log('✂️ [CHUNK] Chunk size:', chunkSize, 'Overlap:', chunkOverlap);
  
  if (!text || text.length === 0) {
    console.log('✂️ [CHUNK] Empty text, returning empty array');
    return [];
  }
  
  const separators = ['\n\n\n', '\n\n', '\n', '. ', '? ', '! ', '; ', ', ', ' '];
  
  function splitRecursive(text: string, separators: string[]): string[] {
    if (text.length <= chunkSize) {
      return [text];
    }
    
    const separator = separators[0];
    const remainingSeparators = separators.slice(1);
    
    const parts = text.split(separator);
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const part of parts) {
      const potentialChunk = currentChunk ? currentChunk + separator + part : part;
      
      if (potentialChunk.length <= chunkSize) {
        currentChunk = potentialChunk;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }
        
        if (part.length > chunkSize) {
          if (remainingSeparators.length > 0) {
            chunks.push(...splitRecursive(part, remainingSeparators));
            currentChunk = '';
          } else {
            const forcedChunks = forceSplit(part, chunkSize, chunkOverlap);
            chunks.push(...forcedChunks);
            currentChunk = '';
          }
        } else {
          currentChunk = part;
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }
  
  function forceSplit(text: string, size: number, overlap: number): string[] {
    const result: string[] = [];
    let start = 0;
    
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      result.push(text.slice(start, end));
      start = end - overlap;
      if (start >= text.length) break;
    }
    
    return result;
  }
  
  const chunks = splitRecursive(text, separators);
  
  const finalChunks: string[] = [];
  let prevChunk = '';
  
  for (const chunk of chunks) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;
    
    if (prevChunk && chunkOverlap > 0) {
      const overlapText = prevChunk.slice(-chunkOverlap);
      finalChunks.push(overlapText + ' ' + trimmed);
    } else {
      finalChunks.push(trimmed);
    }
    prevChunk = trimmed;
  }
  
  console.log('✂️ [CHUNK] Created', finalChunks.length, 'chunks');
  
  return finalChunks;
}
