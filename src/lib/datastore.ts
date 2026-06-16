import { promises as fs } from 'fs'
import path from 'path'

import bcrypt from 'bcryptjs'

const DATA_DIR = path.join(process.cwd(), 'data')

export interface User {
  id: string
  name: string
  email: string
  password: string
  phone?: string
  role: 'ADMIN' | 'RECEPTIONIST'
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  id: string
  name: string
  phone: string
  username: string
  password: string
  mustChangePassword: boolean
  notes?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Service {
  id: string
  name: string
  description?: string
  duration: number
  price: number
  commission: number
  category: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface Professional {
  id: string
  name: string
  phone?: string
  specialty?: string
  whatsapp?: string
  commission: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface AppointmentService {
  serviceId: string
  service: Service
  price: number
  commission: number
  duration: number
}

export interface Appointment {
  id: string
  clientId: string
  client: Client
  professionalId: string
  professional: Professional
  userId?: string
  date: string
  startTime: string
  endTime: string
  status: 'PENDING' | 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  totalPrice: number
  totalDuration: number
  notes?: string
  paid: boolean
  paymentMethod?: string
  services: AppointmentService[]
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  amount: number
  date: string
  category?: string
  createdAt: string
  updatedAt: string
}

async function ensureDataDir() {
  try { await fs.mkdir(DATA_DIR, { recursive: true }) } catch {}
}

async function readFile<T>(filename: string): Promise<T[]> {
  await ensureDataDir()
  const filepath = path.join(DATA_DIR, filename)
  try {
    const data = await fs.readFile(filepath, 'utf-8')
    return JSON.parse(data)
  } catch { return [] }
}

async function writeFile<T>(filename: string, data: T[]): Promise<void> {
  await ensureDataDir()
  await fs.writeFile(path.join(DATA_DIR, filename), JSON.stringify(data, null, 2))
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Users
export async function getUsers(): Promise<User[]> { return readFile<User>('users.json') }
export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await getUsers()
  return users.find(u => u.email === email)
}
export async function createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
  const users = await getUsers()
  const newUser: User = { ...user, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  users.push(newUser)
  await writeFile('users.json', users)
  return newUser
}

// Clients
export async function getClients(search = ''): Promise<Client[]> {
  let clients = await readFile<Client>('clients.json')
  if (search) {
    const s = search.toLowerCase()
    clients = clients.filter(c =>
      c.name.toLowerCase().includes(s) || c.phone.includes(s) || c.username.toLowerCase().includes(s)
    )
  }
  return clients.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getClient(id: string): Promise<Client | undefined> {
  const clients = await readFile<Client>('clients.json')
  return clients.find(c => c.id === id)
}

export async function getClientByUsername(username: string): Promise<Client | undefined> {
  const clients = await readFile<Client>('clients.json')
  return clients.find(c => c.username.toLowerCase() === username.toLowerCase())
}

export function generateUsername(name: string): string {
  const parts = name.toLowerCase().trim().split(/\s+/)
  const base = parts[0]
  const suffix = Math.floor(Math.random() * 9000 + 1000)
  return `${base}${suffix}`
}

export function generatePassword(): string {
  return Math.random().toString(36).slice(-8)
}

export async function createClient(data: Omit<Client, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<Client> {
  const clients = await readFile<Client>('clients.json')

  let username = data.username
  if (!username) {
    username = generateUsername(data.name)
    while (clients.find(c => c.username === username)) {
      username = generateUsername(data.name)
    }
  }

  let plainPassword = data.password
  let mustChange = true
  if (!plainPassword) {
    plainPassword = generatePassword()
  } else {
    mustChange = data.mustChangePassword ?? true
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12)

  const newClient: Client = {
    ...data,
    username,
    password: hashedPassword,
    mustChangePassword: mustChange,
    id: generateId(),
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  clients.push(newClient)
  await writeFile('clients.json', clients)
  // Return client with plain text password so admin can share it
  return { ...newClient, password: plainPassword }
}

export async function updateClient(id: string, data: Partial<Client>): Promise<Client | undefined> {
  const clients = await readFile<Client>('clients.json')
  const index = clients.findIndex(c => c.id === id)
  if (index === -1) return undefined
  clients[index] = { ...clients[index], ...data, updatedAt: new Date().toISOString() }
  await writeFile('clients.json', clients)
  return clients[index]
}

export async function deleteClient(id: string): Promise<boolean> {
  let clients = await readFile<Client>('clients.json')
  clients = clients.filter(c => c.id !== id)
  await writeFile('clients.json', clients)
  return true
}

// Services
export async function getServices(search = '', category = ''): Promise<Service[]> {
  let services = await readFile<Service>('services.json')
  if (search) {
    const s = search.toLowerCase()
    services = services.filter(svc => svc.name.toLowerCase().includes(s) || (svc.description?.toLowerCase().includes(s) ?? false))
  }
  if (category) services = services.filter(svc => svc.category === category)
  return services.sort((a, b) => a.name.localeCompare(b.name))
}

export async function getService(id: string): Promise<Service | undefined> {
  const services = await readFile<Service>('services.json')
  return services.find(s => s.id === id)
}

export async function createService(data: Omit<Service, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  const services = await readFile<Service>('services.json')
  const newService: Service = { ...data, id: generateId(), active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  services.push(newService)
  await writeFile('services.json', services)
  return newService
}

export async function updateService(id: string, data: Partial<Service>): Promise<Service | undefined> {
  const services = await readFile<Service>('services.json')
  const index = services.findIndex(s => s.id === id)
  if (index === -1) return undefined
  services[index] = { ...services[index], ...data, updatedAt: new Date().toISOString() }
  await writeFile('services.json', services)
  return services[index]
}

export async function deleteService(id: string): Promise<boolean> {
  let services = await readFile<Service>('services.json')
  services = services.filter(s => s.id !== id)
  await writeFile('services.json', services)
  return true
}

// Professionals
export async function getProfessionals(): Promise<Professional[]> {
  const profs = await readFile<Professional>('professionals.json')
  return profs.filter(p => p.active).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getRosa(): Promise<Professional | undefined> {
  const profs = await getProfessionals()
  return profs.find(p => p.name.toLowerCase().includes('rosa')) || profs[0]
}

export async function createProfessional(data: Omit<Professional, 'id' | 'active' | 'createdAt' | 'updatedAt'>): Promise<Professional> {
  const profs = await readFile<Professional>('professionals.json')
  const newProf: Professional = { ...data, id: generateId(), active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  profs.push(newProf)
  await writeFile('professionals.json', profs)
  return newProf
}

// Appointments
async function enrichAppointment(appt: any): Promise<Appointment> {
  const [clients, professionals, services] = await Promise.all([
    readFile<Client>('clients.json'),
    readFile<Professional>('professionals.json'),
    readFile<Service>('services.json'),
  ])

  const client = clients.find(c => c.id === appt.clientId) || appt.client
  const professional = professionals.find(p => p.id === appt.professionalId) || appt.professional

  const enrichedServices: AppointmentService[] = (appt.services || []).map((s: any) => {
    const foundService = services.find(sv => sv.id === s.serviceId)
    return {
      serviceId: s.serviceId,
      service: foundService || (s.service ? s.service : { id: s.serviceId, name: 'Serviço', duration: 0, price: s.price || 0, commission: 0, category: '', active: true, createdAt: '', updatedAt: '' }),
      price: s.price,
      commission: s.commission || 0,
      duration: s.duration || 0,
    }
  })

  return {
    ...appt,
    client,
    professional,
    services: enrichedServices,
  }
}

export async function getAppointments(date?: string, professionalId?: string, status?: string, clientId?: string): Promise<Appointment[]> {
  let appointments = await readFile<Appointment>('appointments.json')

  if (date) {
    const targetDate = new Date(date).toDateString()
    appointments = appointments.filter(a => new Date(a.date).toDateString() === targetDate)
  }
  if (professionalId) appointments = appointments.filter(a => a.professionalId === professionalId)
  if (status) appointments = appointments.filter(a => a.status === status)
  if (clientId) appointments = appointments.filter(a => a.clientId === clientId)

  const enriched: Appointment[] = []
  for (const appt of appointments) enriched.push(await enrichAppointment(appt))

  return enriched.sort((a, b) => {
    if (a.date !== b.date) return new Date(a.date).getTime() - new Date(b.date).getTime()
    return a.startTime.localeCompare(b.startTime)
  })
}

export async function getAppointment(id: string): Promise<Appointment | undefined> {
  const appointments = await readFile<Appointment>('appointments.json')
  return appointments.find(a => a.id === id)
}

export async function createAppointment(data: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
  const appointments = await readFile<Appointment>('appointments.json')

  const conflict = appointments.find(a =>
    a.professionalId === data.professionalId &&
    new Date(a.date).toDateString() === new Date(data.date).toDateString() &&
    a.status !== 'CANCELLED' &&
    a.startTime < data.endTime &&
    a.endTime > data.startTime
  )

  if (conflict) throw new Error('Conflito de horário com outro agendamento')

  const newAppointment: Appointment = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  appointments.push(newAppointment)
  await writeFile('appointments.json', appointments)
  return newAppointment
}

export async function updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment | undefined> {
  const appointments = await readFile<Appointment>('appointments.json')
  const index = appointments.findIndex(a => a.id === id)
  if (index === -1) return undefined
  appointments[index] = { ...appointments[index], ...data, updatedAt: new Date().toISOString() }
  await writeFile('appointments.json', appointments)
  return appointments[index]
}

export async function cancelAppointment(id: string): Promise<boolean> {
  return !!await updateAppointment(id, { status: 'CANCELLED' } as Partial<Appointment>)
}

// Transactions
export async function getTransactions(startDate?: string, endDate?: string, type?: string): Promise<Transaction[]> {
  let transactions = await readFile<Transaction>('transactions.json')
  if (startDate && endDate) {
    const start = new Date(startDate).getTime()
    const end = new Date(endDate).getTime()
    transactions = transactions.filter(t => { const d = new Date(t.date).getTime(); return d >= start && d <= end })
  }
  if (type) transactions = transactions.filter(t => t.type === type)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function createTransaction(data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<Transaction> {
  const transactions = await readFile<Transaction>('transactions.json')
  const newTransaction: Transaction = { ...data, id: generateId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  transactions.push(newTransaction)
  await writeFile('transactions.json', transactions)
  return newTransaction
}
