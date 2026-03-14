export interface ExtractedText {
  content: string;
  metadata: {
    title?: string;
    author?: string;
    pageCount?: number;
    format?: string;
  };
}

export async function extractTextFromFile(
  file: File
): Promise<ExtractedText> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
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
    const arrayBuffer = await file.arrayBuffer();
    const pdfParse = await import('pdf-parse');
    // @ts-ignore - pdf-parse has different exports
    const pdf = await pdfParse(arrayBuffer);
    
    return {
      content: pdf.text,
      metadata: {
        pageCount: pdf.numpages,
        format: 'pdf',
      },
    };
  } catch (error) {
    console.error('PDF extraction error:', error);
    return {
      content: `[PDF file: ${file.name}]\n\nPlease upload as text file or use a PDF viewer.`,
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
  return {
    content: `[DOCX file: ${file.name}]\n\nDOCX support coming soon. Please convert to PDF or text.`,
    metadata: {
      format: 'docx',
    },
  };
}

export function splitIntoChunks(
  text: string,
  options: {
    chunkSize?: number;
    chunkOverlap?: number;
  } = {}
): string[] {
  const { chunkSize = 512, chunkOverlap = 50 } = options;
  
  const chunks: string[] = [];
  let startIndex = 0;
  
  while (startIndex < text.length) {
    let endIndex = Math.min(startIndex + chunkSize, text.length);
    
    if (endIndex < text.length) {
      const breakPoint = text.lastIndexOf('\n\n', endIndex);
      if (breakPoint > startIndex) {
        endIndex = breakPoint + 2;
      } else {
        const spaceBreak = text.lastIndexOf(' ', endIndex);
        if (spaceBreak > startIndex) {
          endIndex = spaceBreak + 1;
        }
      }
    }
    
    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk) {
      chunks.push(chunk);
    }
    
    startIndex = endIndex - chunkOverlap;
    if (startIndex <= 0 || startIndex >= text.length) break;
  }
  
  return chunks;
}
