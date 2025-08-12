import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

// Input validation schema
const querySchema = z.object({
  query: z.string().min(1)
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { query } = querySchema.parse(body)
    
    // Execute raw query using Prisma
    const result = await prisma.$queryRawUnsafe(query)
    
    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    
    console.error('SQL query error:', error)
    return NextResponse.json(
      { error: 'Error executing query' }, 
      { status: 500 }
    )
  }
}
