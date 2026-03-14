const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';

export type LLMProvider = 'openrouter' | 'nvidia' | 'openai';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  provider?: LLMProvider;
}

export interface ChatResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function chat(options: ChatOptions, apiKey: string): Promise<ChatResponse> {
  const { model, messages, temperature = 0.7, maxTokens, stream = false, provider = 'openrouter' } = options;

  let url: string;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'nvidia') {
    url = `${NVIDIA_BASE_URL}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['Accept'] = stream ? 'text/event-stream' : 'application/json';
  } else {
    url = `${OPENROUTER_BASE_URL}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'NexusRAG';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
      stream,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to get chat completion');
  }

  return await response.json();
}

export async function* streamChat(options: ChatOptions, apiKey: string): AsyncGenerator<string> {
  const { model, messages, temperature = 0.7, maxTokens, provider = 'openrouter' } = options;

  let url: string;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (provider === 'nvidia') {
    url = `${NVIDIA_BASE_URL}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['Accept'] = 'text/event-stream';
  } else {
    url = `${OPENROUTER_BASE_URL}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = 'http://localhost:3000';
    headers['X-Title'] = 'NexusRAG';
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages,
      temperature,
      ...(maxTokens && { max_tokens: maxTokens }),
      stream: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to stream chat completion');
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    throw new Error('Response body is null');
  }

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      const data = trimmed.slice(6);
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        continue;
      }
    }
  }
}

export const DEFAULT_MODELS = [
  { id: 'openrouter/auto', name: 'Auto (Best)', provider: 'openrouter' },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter' },
  { id: 'anthropic/claude-3-opus', name: 'Claude 3 Opus', provider: 'openrouter' },
  { id: 'openai/gpt-4o', name: 'GPT-4o', provider: 'openrouter' },
  { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openrouter' },
  { id: 'google/gemini-pro-1.5', name: 'Gemini Pro 1.5', provider: 'openrouter' },
  { id: 'meta-llama/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', provider: 'openrouter' },
  { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', provider: 'openrouter' },
  { id: 'nvidia/llama-4-maverick-17b-128e-instruct', name: 'Llama 4 Maverick', provider: 'nvidia' },
  { id: 'nvidia/llama-3-3-70b-instruct', name: 'Llama 3.3 70B', provider: 'nvidia' },
  { id: 'nvidia/nemotron-4-15b-instruct', name: 'Nemotron 4 15B', provider: 'nvidia' },
  { id: 'nvidia/flux-1-dev-fp8', name: 'Flux 1 Dev', provider: 'nvidia' },
];

export const PROVIDERS = [
  { id: 'openrouter', name: 'OpenRouter', models: DEFAULT_MODELS.filter(m => m.provider === 'openrouter') },
  { id: 'nvidia', name: 'NVIDIA', models: DEFAULT_MODELS.filter(m => m.provider === 'nvidia') },
];
