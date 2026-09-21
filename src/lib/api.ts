import type { AgentSignal, TokenOpportunity } from '../types';

export interface XAdapterEvent {
  tokenAddress: string;
  tokenSymbol: string;
  source: string;
  score: number | null;
  detectedAt: number;
  reasons: string[];
}

export interface MarketSnapshot {
  source: 'LIVE' | 'MOCK' | 'DISCONNECTED';
  fetchedAt?: number;
  tokens: TokenOpportunity[];
  signals?: AgentSignal[];
  xSignals?: XAdapterEvent[];
  cacheExpiresAt?: number;
}

export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Abort an individual fetch without cancelling unrelated requests. */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  timeoutMs = 8000,
): Promise<T> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(endpoint, { ...options, signal: controller.signal });
    if (!response.ok) throw new ApiError(`Request failed (${response.status})`, response.status);
    return await response.json() as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) {
      throw new ApiError(options.signal?.aborted ? 'Request cancelled' : 'Request timed out');
    }
    throw new ApiError(error instanceof Error ? error.message : 'Network unavailable');
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}

export function uniqueTokens(tokens: TokenOpportunity[]): TokenOpportunity[] {
  const addresses = new Set<string>();
  return tokens.filter(token => {
    const address = token.address?.trim();
    if (!address || addresses.has(address)) return false;
    addresses.add(address);
    return true;
  });
}

export function isFreshLiveMarket(source: MarketSnapshot['source'], fetchedAt: number | null, now = Date.now(), ttlMs = 60_000): boolean {
  return source === 'LIVE' && fetchedAt !== null && Number.isFinite(fetchedAt) &&
    fetchedAt <= now && now - fetchedAt <= ttlMs;
}
