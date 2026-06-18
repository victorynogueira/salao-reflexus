import { NextResponse } from 'next/server'
import { getService, updateService, deleteService } from '@/lib/datastore'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const service = await getService(id)
    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const service = await updateService(id, body)
    if (!service) {
      return NextResponse.json({ error: 'Serviço não encontrado' }, { status: 404 })
    }
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await deleteService(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
