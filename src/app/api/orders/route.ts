import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { items: true, escalations: true },
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
