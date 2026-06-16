import { NextResponse } from 'next/server'
import { getProfessionals, createProfessional } from '@/lib/datastore'

export async function GET() {
  try {
    const professionals = await getProfessionals()
    return NextResponse.json(professionals)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, phone, specialty, commission } = body

    if (!name) {
      return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 })
    }

    const professional = await createProfessional({
      name,
      phone,
      specialty,
      commission: parseFloat(commission) || 0,
    })

    return NextResponse.json(professional, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
