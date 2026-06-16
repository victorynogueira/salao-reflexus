import { NextResponse } from 'next/server'
import { getTransactions, createTransaction } from '@/lib/datastore'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const type = searchParams.get('type') || undefined

    const transactions = await getTransactions(startDate, endDate, type)
    return NextResponse.json(transactions)
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { type, description, amount, category } = body

    if (!type || !description || !amount) {
      return NextResponse.json({ error: 'Tipo, descrição e valor são obrigatórios' }, { status: 400 })
    }

    const transaction = await createTransaction({
      type: type as 'INCOME' | 'EXPENSE',
      description,
      amount: parseFloat(amount),
      category,
      date: new Date().toISOString(),
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
