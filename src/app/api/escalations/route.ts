import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export async function GET() {
  try {
    const escalations = await prisma.escalation.findMany({
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(escalations)
  } catch (error) {
    console.error('Error fetching escalations', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
