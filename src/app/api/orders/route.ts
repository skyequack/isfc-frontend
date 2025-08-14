import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ItemCategory } from '@prisma/client';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: { 
        customer: true,
        items: true, 
        escalations: true 
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.customer?.name || !body.customer?.email || !body.event || !body.date || !body.guests || !body.items?.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create or update customer
    const customer = await prisma.customer.upsert({
      where: { email: body.customer.email },
      update: {
        name: body.customer.name,
        phone: body.customer.phone || null,
      },
      create: {
        name: body.customer.name,
        email: body.customer.email,
        phone: body.customer.phone || null,
      },
    });

    // Calculate total from items
    const total = body.items.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + (Number(item.price) * Number(item.quantity)),
      0
    );

    // Create order
    const order = await prisma.order.create({
      data: {
        customer: {
          connect: {
            id: customer.id
          }
        },
        event: body.event,
        date: new Date(body.date),
        time: body.time || null,
        guests: Number(body.guests),
        status: 'PENDING',
        total,
        requirements: body.requirements || [],
        items: {
          create: body.items.map((item: { name: string; quantity: number; price: number; category: string; }) => ({
            name: item.name,
            quantity: Number(item.quantity),
            price: Number(item.price),
            category: item.category.toUpperCase() as ItemCategory,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Fetch complete order with all relations
    const completeOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        customer: true,
        items: true,
        escalations: true,
      },
    });

    return NextResponse.json({ success: true, order: completeOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}
