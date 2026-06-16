import { createUser, getUserByEmail, createClient, createService, createProfessional, createTransaction } from '@/lib/datastore'
import bcrypt from 'bcryptjs'

export async function seedDatabase() {
  const admin = await getUserByEmail('admin@reflexus.com')
  if (admin) return

  console.log('Seeding database...')

  const hashedPassword = await bcrypt.hash('admin123', 12)

  await createUser({
    name: 'Administrador',
    email: 'admin@reflexus.com',
    password: hashedPassword,
    role: 'ADMIN',
    active: true,
  })

  await createUser({
    name: 'Recepção',
    email: 'recepcao@reflexus.com',
    password: hashedPassword,
    role: 'RECEPTIONIST',
    active: true,
  })

  const professionals = [
    { name: 'Ana Silva', specialty: 'Cabelereira', commission: 30 },
    { name: 'Carlos Santos', specialty: 'Barbeiro', commission: 25 },
    { name: 'Maria Oliveira', specialty: 'Manicure/Pedicure', commission: 35 },
    { name: 'João Pereira', specialty: 'Colorista', commission: 30 },
  ]

  for (const prof of professionals) {
    await createProfessional({
      name: prof.name,
      specialty: prof.specialty,
      commission: prof.commission,
    })
  }

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

  const sampleClients = [
    { name: 'Maria Souza', phone: '11999999999', email: 'maria@email.com' },
    { name: 'João Silva', phone: '11988888888' },
    { name: 'Ana Costa', phone: '11977777777', email: 'ana@email.com' },
    { name: 'Pedro Santos', phone: '11966666666' },
    { name: 'Lucia Ferreira', phone: '11955555555', email: 'lucia@email.com' },
  ]

  for (const client of sampleClients) {
    await createClient(client)
  }

  console.log('Database seeded successfully!')
  console.log('Login: admin@reflexus.com / admin123')
}
