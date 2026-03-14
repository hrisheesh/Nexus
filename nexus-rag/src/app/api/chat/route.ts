import { NextRequest, NextResponse } from 'next/server';
import { chat, type LLMProvider } from '@/lib/llm';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY;
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'openrouter/auto';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'nvidia/llama-4-maverick-17b-128e-instruct';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const provider = (body.provider as LLMProvider) || 'openrouter';
    
    let model: string;
    let actualProvider: LLMProvider;
    
    if (provider === 'nvidia') {
      actualProvider = 'nvidia';
      model = body.model || NVIDIA_MODEL;
    } else {
      actualProvider = 'openrouter';
      model = body.model || DEFAULT_MODEL;
    }

    const temperature = body.temperature || 0.7;

    let apiKey: string;
    if (actualProvider === 'nvidia') {
      apiKey = NVIDIA_API_KEY || '';
      if (!apiKey) {
        return NextResponse.json({ 
          response: 'NVIDIA API key not configured. Please add NVIDIA_API_KEY to .env',
          sources: []
        });
      }
    } else {
      apiKey = OPENROUTER_API_KEY || '';
      if (!apiKey) {
        return NextResponse.json({ 
          response: 'OpenRouter API key not configured. Please add OPENROUTER_API_KEY to .env',
          sources: []
        });
      }
    }

    console.log('\n========== CHAT REQUEST ==========');
    console.log('Provider:', actualProvider);
    console.log('Model:', model);
    console.log('Message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));
    console.log('===================================\n');

    const systemPrompt = `You are a helpful AI assistant. Be concise and friendly.`;

    const response = await chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      temperature,
      provider: actualProvider,
    }, apiKey);

    const assistantMessage = response.choices?.[0]?.message?.content || 'I could not generate a response.';

    console.log('\n========== CHAT RESPONSE =========');
    console.log('Response:', assistantMessage.substring(0, 200) + (assistantMessage.length > 200 ? '...' : ''));
    console.log('===================================\n');

    return NextResponse.json({
      response: assistantMessage,
      sources: [],
    });
  } catch (error) {
    console.error('\n========== CHAT ERROR =========');
    console.error(error);
    console.error('==============================\n');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get response' },
      { status: 500 }
    );
  }
}
