import { buildApiUrl } from './apiConfig';

const DEFAULT_REQUEST_TIMEOUT_MS = 5000;

export class ApiRequestError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = 'ApiRequestError';
  }
}

interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<ResponseBody>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<ResponseBody> {
  const { timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, ...requestOptions } = options;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const response = await fetch(buildApiUrl(path), {
      ...requestOptions,
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new ApiRequestError(
        await buildApiErrorMessage(path, response),
        response.status
      );
    }

    if (response.status === 204) {
      return null as any;
    }

    const text = await response.text();
    if (!text) {
      return null as any;
    }
    
    return JSON.parse(text) as ResponseBody;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function buildApiErrorMessage(path: string, response: Response) {
  try {
    const responseBody = await response.json();
    const apiMessage = extractApiMessage(responseBody);

    if (apiMessage) {
      return apiMessage;
    }
  } catch {
    try {
      const responseText = await response.text();
      if (responseText.trim()) {
        return responseText;
      }
    } catch {
      return `API request failed: ${path}`;
    }
  }

  return `API request failed: ${path}`;
}

function extractApiMessage(responseBody: unknown): string | null {
  if (!responseBody || typeof responseBody !== 'object') {
    return null;
  }

  const message = Reflect.get(responseBody, 'message');

  if (typeof message === 'string' && message.trim()) {
    return message;
  }

  if (Array.isArray(message) && message.length > 0) {
    return message.join(', ');
  }

  return null;
}
