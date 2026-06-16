import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatTime(time: string): string {
  return time
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

export function parsePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

export function getWhatsAppLink(phone: string, message: string): string {
  const cleaned = parsePhone(phone)
  const number = cleaned.startsWith('55') ? cleaned : `55${cleaned}`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes + durationMinutes
  const endHours = Math.floor(totalMinutes / 60)
  const endMinutes = totalMinutes % 60
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`
}

export function calculateDuration(startTime: string, endTime: string): number {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  return (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes)
}

export function generateTimeSlots(startTime: string, endTime: string, interval: number = 30): string[] {
  const slots: string[] = []
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)

  let current = startHours * 60 + startMinutes
  const end = endHours * 60 + endMinutes

  while (current < end) {
    const hours = Math.floor(current / 60)
    const minutes = current % 60
    slots.push(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`)
    current += interval
  }

  return slots
}
