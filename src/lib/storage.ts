import { promises as fs } from 'fs'
import path from 'path'
import { kvRead, kvWrite, isKvAvailable } from './kv-store'

const DATA_DIR = path.join(process.cwd(), 'data')

const collectionMap: Record<string, string> = {
  'users.json': 'users',
  'clients.json': 'clients',
  'services.json': 'services',
  'professionals.json': 'professionals',
  'appointments.json': 'appointments',
  'transactions.json': 'transactions',
  'messages.json': 'messages',
}

function toCollection(filename: string): string {
  return collectionMap[filename] || filename.replace('.json', '')
}

async function ensureDataDir() {
  if (isKvAvailable()) return
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
}

export async function readData<T>(filename: string): Promise<T[]> {
  if (isKvAvailable()) {
    return kvRead<T>(toCollection(filename))
  }
  await ensureDataDir()
  const filepath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(data)
  } catch { return [] }
}

export async function writeData<T>(filename: string, data: T[]): Promise<void> {
  if (isKvAvailable()) {
    return kvWrite(toCollection(filename), data)
  }
  await ensureDataDir()
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2))
}
