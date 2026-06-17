import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUser, createClient, createService, createProfessional, generatePassword } from '@/lib/datastore'
import { readData, writeData } from '@/lib/storage'
import { kvSeedIfEmpty, isKvAvailable } from '@/lib/kv-store'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const force = searchParams.get('force') === 'true'

  if (force) {
    if (isKvAvailable()) {
      await kvSeedIfEmpty()
    }
    await writeData('users.json', [])
    await writeData('clients.json', [])
    await writeData('services.json', [])
    await writeData('professionals.json', [])
    await writeData('appointments.json', [])
    await writeData('transactions.json', [])
    if (isKvAvailable()) {
      const { kv } = await import('@vercel/kv')
      await kv.set('initialized', false)
    }
  }

  try {
    const admin = await getUserByEmail('admin@reflexus.com')
    if (admin && !force) {
      return NextResponse.json({ message: 'Database already initialized' })
    }

    console.log('Seeding database...')

    const hashedPassword = await bcrypt.hash('admin123', 12)

    await createUser({
      name: 'Administrador',
      email: 'admin@reflexus.com',
      password: hashedPassword,
      role: 'ADMIN',
      active: true,
    })

    // Rosa - única profissional do salão
    const rosaWhatsapp = process.env.ROSA_WHATSAPP || '5511999999999'
    await createProfessional({
      name: 'Rosa',
      specialty: 'Cabeleireira',
      commission: 30,
      phone: rosaWhatsapp,
      whatsapp: rosaWhatsapp,
    })

    const services = [
      { name: 'Corte Masculino', description: 'Corte de cabelo masculino completo', duration: 30, price: 45, commission: 15, category: 'Corte' },
      { name: 'Corte Feminino', description: 'Corte de cabelo feminino completo', duration: 45, price: 65, commission: 20, category: 'Corte' },
      { name: 'Escova', description: 'Escova modelada', duration: 60, price: 80, commission: 25, category: 'Escova' },
      { name: 'Hidratação', description: 'Hidratação profunda dos fios', duration: 40, price: 55, commission: 18, category: 'Tratamento' },
      { name: 'Progressiva', description: 'Escova progressiva', duration: 120, price: 150, commission: 45, category: 'Tratamento' },
      { name: 'Manicure', description: 'Manicure completa', duration: 30, price: 30, commission: 12, category: 'Manicure/Pedicure' },
      { name: 'Pedicure', description: 'Pedicure completa', duration: 30, price: 35, commission: 14, category: 'Manicure/Pedicure' },
      { name: 'Sobrancelha', description: 'Design de sobrancelha', duration: 20, price: 25, commission: 10, category: 'Sobrancelha' },
      { name: 'Maquiagem', description: 'Maquiagem social ou festa', duration: 60, price: 100, commission: 35, category: 'Maquiagem' },
      { name: 'Coloração', description: 'Coloração completa', duration: 90, price: 120, commission: 40, category: 'Coloração' },
      { name: 'Mechas/Luzes', description: 'Mechas ou luzes nos cabelos', duration: 120, price: 180, commission: 55, category: 'Coloração' },
      { name: 'Barba', description: 'Barba completa com navalha', duration: 20, price: 25, commission: 8, category: 'Barba' },
    ]

    for (const svc of services) {
      await createService(svc)
    }

    const samplePassword = generatePassword()
    const hashedSamplePassword = await bcrypt.hash(samplePassword, 12)

    const sampleClients = [
      { name: 'Maria Souza', phone: '11999999999' },
      { name: 'Ana Costa', phone: '11977777777' },
      { name: 'Lucia Ferreira', phone: '11955555555' },
    ]

    for (const c of sampleClients) {
      await createClient({
        name: c.name,
        phone: c.phone,
        password: samplePassword,
        mustChangePassword: true,
      })
    }

    console.log('Database seeded successfully!')
    return NextResponse.json({
      message: 'Database seeded',
      samplePassword,
      rosaWhatsapp,
    })
  } catch (error: any) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Send POST request to seed' })
}
