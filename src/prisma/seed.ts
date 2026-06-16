import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const hashedPassword = await hashPassword('admin123')

  const admin = await prisma.user.upsert({
    where: { email: 'admin@reflexus.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@reflexus.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const receptionist = await prisma.user.upsert({
    where: { email: 'recepcao@reflexus.com' },
    update: {},
    create: {
      name: 'Recepção',
      email: 'recepcao@reflexus.com',
      password: hashedPassword,
      role: 'RECEPTIONIST',
    },
  })

  console.log('Users created')

  const professionals = [
    { name: 'Ana Silva', specialty: 'Cabelereira', commission: 30 },
    { name: 'Carlos Santos', specialty: 'Barbeiro', commission: 25 },
    { name: 'Maria Oliveira', specialty: 'Manicure/Pedicure', commission: 35 },
    { name: 'João Pereira', specialty: 'Colorista', commission: 30 },
  ]

  for (const prof of professionals) {
    await prisma.professional.upsert({
      where: { id: prof.name.toLowerCase().replace(/\s/g, '-') },
      update: {},
      create: {
        id: prof.name.toLowerCase().replace(/\s/g, '-'),
        name: prof.name,
        specialty: prof.specialty,
        commission: prof.commission,
      },
    })
  }

  console.log('Professionals created')

  const services = [
    { name: 'Corte Masculino', description: 'Corte de cabelo masculino completo', duration: 30, price: 45, commission: 15, category: 'Corte' },
    { name: 'Corte Feminino', description: 'Corte de cabelo feminino completo', duration: 45, price: 65, commission: 20, category: 'Corte' },
    { name: 'Escova', description: 'Escova progressiva ou definitiva', duration: 60, price: 80, commission: 25, category: 'Escova' },
    { name: 'Hidratação', description: 'Hidratação profunda dos fios', duration: 40, price: 55, commission: 18, category: 'Tratamento' },
    { name: 'Progressiva', description: 'Escova progressiva com formol', duration: 120, price: 150, commission: 45, category: 'Tratamento' },
    { name: 'Manicure', description: 'Manicure completa', duration: 30, price: 30, commission: 12, category: 'Manicure/Pedicure' },
    { name: 'Pedicure', description: 'Pedicure completa', duration: 30, price: 35, commission: 14, category: 'Manicure/Pedicure' },
    { name: 'Sobrancelha', description: 'Design de sobrancelha', duration: 20, price: 25, commission: 10, category: 'Sobrancelha' },
    { name: 'Maquiagem', description: 'Maquiagem social ou festa', duration: 60, price: 100, commission: 35, category: 'Maquiagem' },
    { name: 'Coloração', description: 'Coloração completa', duration: 90, price: 120, commission: 40, category: 'Coloração' },
    { name: 'Mechas/Luzes', description: 'Mechas ou luzes nos cabelos', duration: 120, price: 180, commission: 55, category: 'Coloração' },
    { name: 'Barba', description: 'Barba completa com navalha', duration: 20, price: 25, commission: 8, category: 'Barba' },
  ]

  for (const svc of services) {
    await prisma.service.upsert({
      where: { id: svc.name.toLowerCase().replace(/\s/g, '-') },
      update: {},
      create: {
        id: svc.name.toLowerCase().replace(/\s/g, '-'),
        name: svc.name,
        description: svc.description,
        duration: svc.duration,
        price: svc.price,
        commission: svc.commission,
        category: svc.category,
      },
    })
  }

  console.log('Services created')

  console.log('Database seeded successfully!')
  console.log('\nLogin credentials:')
  console.log('Admin: admin@reflexus.com / admin123')
  console.log('Receptionist: recepcao@reflexus.com / admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
