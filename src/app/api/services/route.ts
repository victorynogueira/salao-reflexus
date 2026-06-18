import { NextResponse } from 'next/server'
import { getServices, createService } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const services = await getServices(search, category)
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, duration, price, commission, category, priceToConfirm } = body

    if (!name || !duration || !category) {
      return NextResponse.json({ error: 'Nome, duração e categoria são obrigatórios' }, { status: 400 })
    }

    if (!priceToConfirm && !price) {
      return NextResponse.json({ error: 'Valor é obrigatório quando não for "Preço a confirmar"' }, { status: 400 })
    }

    const service = await createService({
      name,
      description,
      duration: parseInt(duration),
      price: parseFloat(price) || 0,
      commission: parseFloat(commission) || 0,
      category,
      priceToConfirm: !!priceToConfirm,
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
