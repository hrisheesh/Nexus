import type { Settings } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateSettings(settings: Partial<Settings>): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!settings.openrouterApiKey || settings.openrouterApiKey.trim() === '') {
    warnings.push('API key is not set. You can set it in Settings or .env file.');
  } else if (!settings.openrouterApiKey.startsWith('sk-or-')) {
    errors.push('Invalid OpenRouter API key format. Key should start with "sk-or-".');
  }

  if (!settings.selectedModel || settings.selectedModel.trim() === '') {
    errors.push('Model is required.');
  }

  if (settings.temperature !== undefined) {
    if (settings.temperature < 0 || settings.temperature > 2) {
      errors.push('Temperature must be between 0 and 2.');
    }
  }

  if (settings.chunkSize !== undefined) {
    if (settings.chunkSize < 100 || settings.chunkSize > 10000) {
      warnings.push('Chunk size recommended between 100-10000. Current: ' + settings.chunkSize);
    }
  }

  if (settings.chunkOverlap !== undefined && settings.chunkSize !== undefined) {
    if (settings.chunkOverlap < 0 || settings.chunkOverlap > settings.chunkSize) {
      errors.push('Chunk overlap must be between 0 and chunk size.');
    }
  }

  if (settings.topK !== undefined) {
    if (settings.topK < 1 || settings.topK > 100) {
      warnings.push('Top K recommended between 1-100. Current: ' + settings.topK);
    }
  }

  if (settings.hybridSearchAlpha !== undefined) {
    if (settings.hybridSearchAlpha < 0 || settings.hybridSearchAlpha > 1) {
      errors.push('Hybrid search alpha must be between 0 and 1.');
    }
  }

  if (settings.maxContextMessages !== undefined) {
    if (settings.maxContextMessages < 1 || settings.maxContextMessages > 50) {
      warnings.push('Max context messages recommended between 1-50. Current: ' + settings.maxContextMessages);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function getEnvValidation(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!process.env.OPENROUTER_API_KEY) {
    warnings.push('OPENROUTER_API_KEY not set in .env');
  }

  if (!process.env.MONGODB_URI) {
    warnings.push('MONGODB_URI not set in .env');
  }

  if (!process.env.QDRANT_URL) {
    warnings.push('QDRANT_URL not set in .env');
  }

  if (!process.env.REDIS_URL) {
    warnings.push('REDIS_URL not set in .env');
  }

  return {
    isValid: true,
    errors,
    warnings,
  };
}
