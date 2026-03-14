import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { message, settings } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!settings?.model) {
      return NextResponse.json({ error: 'Model not configured' }, { status: 400 });
    }

    const openrouterKey = settings.openrouterApiKey || process.env.OPENROUTER_API_KEY;
    
    if (!openrouterKey) {
      return NextResponse.json({ 
        response: 'Please configure your OpenRouter API key in Settings.',
        sources: []
      });
    }

    const systemPrompt = `You are a helpful AI assistant that answers questions based on the provided context from documents. 
    - Always base your answers on the provided context when available.
    - If the context doesn't contain enough information, say so clearly.
    - Be concise and direct in your responses.
    - Use bullet points when listing multiple items.
    - Always cite your sources when using context.`;

    const contextSection = settings.context && settings.context.length > 0
      ? `\n\nRelevant context from documents:\n${settings.context.join('\n\n')}`
      : '\n\nNo documents have been uploaded yet. If the user asks about documents, please let them know they need to upload documents first.';

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'NexusRAG',
      },
      body: JSON.stringify({
        model: settings.model,
        messages: [
          { role: 'system', content: systemPrompt + contextSection },
          { role: 'user', content: message },
        ],
        temperature: settings.temperature || 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from LLM');
    }

    const data = await response.json();
    const assistantMessage = data.choices?.[0]?.message?.content || 'I apologize, but I could not generate a response.';

    return NextResponse.json({
      response: assistantMessage,
      sources: [],
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
