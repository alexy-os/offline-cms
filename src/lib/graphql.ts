export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string; extensions?: { code?: string; queued?: boolean; queueId?: string } }>;
  extensions?: { queued?: boolean; queueId?: string; message?: string };
};

export function getGraphQLEndpoint(): string {
  // Use VITE_GRAPHQL_ENDPOINT if set, otherwise use proxy path
  const envEndpoint = (import.meta as any).env?.VITE_GRAPHQL_ENDPOINT;
  if (envEndpoint) return envEndpoint;
  
  // In development, use Vite proxy to avoid CORS
  return '/api/graphql';
}

export function getApiBaseUrl(): string {
  const envEndpoint = (import.meta as any).env?.VITE_GRAPHQL_ENDPOINT;
  if (envEndpoint) return envEndpoint.replace('/graphql', '');
  
  // In development, use Vite proxy
  return '/api';
}

export async function fetchGraphQL<T>(params: {
  query: string;
  variables?: Record<string, any>;
  signal?: AbortSignal;
}): Promise<GraphQLResponse<T>> {
  const res = await fetch(getGraphQLEndpoint(), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: params.query, variables: params.variables }),
    signal: params.signal,
  });

  return (await res.json()) as GraphQLResponse<T>;
}

// API health check - returns offline status if API unavailable
export async function fetchApiHealth() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/health`);
    if (!res.ok) throw new Error('API unavailable');
    return await res.json();
  } catch {
    return { status: 'offline', message: 'API server not available' };
  }
}

// Sync local database from upstream
export async function syncLocalDatabase() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/local/sync`, { method: 'POST' });
    if (!res.ok) throw new Error('Sync failed');
    return await res.json();
  } catch {
    return { success: false, error: 'API unavailable - working offline' };
  }
}

// Get local database contents - returns empty data if unavailable
export async function getLocalData() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/local/data`);
    if (!res.ok) throw new Error('Data unavailable');
    return await res.json();
  } catch {
    return { 
      data: null, 
      offline: true,
      message: 'Working in offline mode - no cached data available'
    };
  }
}

// Flush mutation queue
export async function flushMutationQueue() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/flush`, { method: 'POST' });
    if (!res.ok) throw new Error('Flush failed');
    return await res.json();
  } catch {
    return { success: false, error: 'API unavailable - mutations queued locally' };
  }
}

// Get queued mutations
export async function getQueuedMutations() {
  try {
    const res = await fetch(`${getApiBaseUrl()}/queue`);
    if (!res.ok) throw new Error('Queue unavailable');
    return await res.json();
  } catch {
    return { queue: [], offline: true };
  }
}
