import { kv } from '@vercel/kv'

const COLLECTIONS = ['users', 'clients', 'services', 'professionals', 'appointments', 'transactions']

export async function kvRead<T>(collection: string): Promise<T[]> {
  try {
    const data = await kv.get<T[]>(collection)
    return data || []
  } catch {
    return []
  }
}

export async function kvWrite<T>(collection: string, data: T[]): Promise<void> {
  await kv.set(collection, data)
}

export function isKvAvailable(): boolean {
  return !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN
}

export async function kvSeedIfEmpty(): Promise<boolean> {
  const hasData = await kv.get<boolean>('initialized')
  if (hasData) return false
  await kv.set('initialized', true)
  return true
}
