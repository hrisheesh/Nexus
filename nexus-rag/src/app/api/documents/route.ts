import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { extractTextFromFile, splitIntoChunks } from '@/lib/text-extraction';

export const runtime = 'nodejs';
export const maxDuration = 300;

const ALLOWED_EXTENSIONS = ['pdf', 'txt', 'md', 'markdown', 'csv', 'docx'];
const MAX_SIZE = 50 * 1024 * 1024;

const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

function validateFile(file: File): { valid: boolean; error?: string } {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension)) {
    return { valid: false, error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }
  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File too large. Max 50MB' };
  }
  return { valid: true };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('📄 [DOCUMENT] Starting upload:', file.name);
    console.log('📄 [DOCUMENT] File size:', formatFileSize(file.size));

    const validation = validateFile(file);
    if (!validation.valid) {
      console.log('❌ [DOCUMENT] Validation failed:', validation.error);
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const extension = file.name.split('.').pop()?.toLowerCase() || 'txt';
    const fileType = extension === 'markdown' ? 'md' : extension;

    const docId = uuidv4();
    console.log('🔍 [DOCUMENT] Extracting text from', fileType, 'file...');
    
    const extracted = await extractTextFromFile(file);
    const text = extracted.content;
    
    console.log('✅ [DOCUMENT] Text extracted successfully');
    console.log('📊 [DOCUMENT] Extracted text length:', text.length, 'chars');
    console.log('📊 [DOCUMENT] Extracted text preview:', text.slice(0, 200).replace(/\n/g, '\\n'), '...');
    if (extracted.metadata.pageCount) {
      console.log('📊 [DOCUMENT] Page count:', extracted.metadata.pageCount);
    }
    
    if (text.length < 100) {
      console.warn('⚠️ [DOCUMENT] WARNING: Extracted text is very short! This may indicate extraction failure.');
      console.warn('⚠️ [DOCUMENT] Full extracted text:', text);
    }

    console.log('✂️ [DOCUMENT] Splitting into chunks (size:', CHUNK_SIZE, 'overlap:', CHUNK_OVERLAP, ')...');
    const chunks = splitIntoChunks(text, { chunkSize: CHUNK_SIZE, chunkOverlap: CHUNK_OVERLAP });
    console.log('✅ [DOCUMENT] Created', chunks.length, 'chunks');
    
    if (chunks.length > 0) {
      console.log('📝 [DOCUMENT] First chunk preview:', chunks[0].slice(0, 100).replace(/\n/g, '\\n'), '...');
      console.log('📝 [DOCUMENT] Last chunk preview:', chunks[chunks.length - 1].slice(0, 100).replace(/\n/g, '\\n'), '...');
    }

    const document = {
      id: docId,
      name: file.name,
      type: fileType,
      size: file.size,
      sizeFormatted: formatFileSize(file.size),
      uploadedAt: new Date().toISOString(),
      lastRefreshed: new Date().toISOString(),
      version: 1,
      metadata: { 
        format: fileType, 
        originalSize: text.length,
        charCount: text.length,
        pageCount: extracted.metadata.pageCount,
      },
      accessRoles: ['user'],
      indexName: 'nexus-documents',
      status: 'ready' as const,
      chunks: chunks.length,
    };

    console.log('✅ [DOCUMENT] Upload complete:', document.name, '-', chunks.length, 'chunks');

    return NextResponse.json({
      document,
      message: `Uploaded. File size: ${formatFileSize(file.size)}, Text: ${text.length} chars, Chunks: ${chunks.length}`,
    });

  } catch (error) {
    console.error('❌ [DOCUMENT] Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ documents: [], total: 0 });
}
