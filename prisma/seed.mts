import { PrismaClient, OrderStatus, EscalationPriority, EscalationStatus, ItemCategory } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete existing data
  await prisma.orderItem.deleteMany();
  await prisma.escalation.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();

  // Create customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-0123',
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '555-0124',
    },
  });

  // Create orders for customers
  await prisma.order.create({
    data: {
      customer: { connect: { id: customer1.id } },
      event: 'Wedding Reception',
      date: new Date('2025-12-20'),
      time: '18:00',
      guests: 100,
      status: OrderStatus.CONFIRMED,
      total: 5000.0,
      requirements: ['Dance floor', 'Stage setup'],
      items: {
        create: [
          {
            name: 'Round Tables',
            quantity: 10,
            price: 50.0,
            category: ItemCategory.FURNITURE,
          },
          {
            name: 'Chairs',
            quantity: 100,
            price: 10.0,
            category: ItemCategory.FURNITURE,
          },
          {
            name: 'Table Linens',
            quantity: 10,
            price: 20.0,
            category: ItemCategory.LINENS,
          },
        ],
      },
      escalations: {
        create: [
          {
            priority: EscalationPriority.LOW,
            status: EscalationStatus.OPEN,
            description: 'Need additional chairs',
          },
        ],
      },
    },
  });

  await prisma.order.create({
    data: {
      customer: { connect: { id: customer2.id } },
      event: 'Corporate Conference',
      date: new Date('2025-09-15'),
      time: '09:00',
      guests: 50,
      status: OrderStatus.PENDING,
      total: 2500.0,
      requirements: ['Projector', 'Sound system'],
      items: {
        create: [
          {
            name: 'Conference Tables',
            quantity: 5,
            price: 100.0,
            category: ItemCategory.FURNITURE,
          },
          {
            name: 'Chairs',
            quantity: 50,
            price: 10.0,
            category: ItemCategory.FURNITURE,
          },
          {
            name: 'Projector Setup',
            quantity: 1,
            price: 500.0,
            category: ItemCategory.EQUIPMENT,
          },
        ],
      },
    },
  });

  // Create a food-related order (customer1)
  await prisma.order.create({
    data: {
      customer: { connect: { id: customer1.id } },
      event: 'Birthday Party',
      date: new Date('2025-09-01'),
      time: '19:00',
      guests: 30,
      status: OrderStatus.PENDING,
      total: 1000.0,
      requirements: ['Vegetarian options needed'],
      items: {
        create: [
          {
            name: 'Catering Package',
            quantity: 1,
            price: 1000.0,
            category: ItemCategory.FOOD,
          },
        ],
      },
    },
  });

  // Create a food-related order (customer2)
  await prisma.order.create({
    data: {
      customer: { connect: { id: customer2.id } },
      event: 'Birthday Party',
      date: new Date('2025-09-01'),
      time: '19:00',
      guests: 30,
      status: OrderStatus.PENDING,
      total: 1000.0,
      requirements: ['Vegetarian options needed'],
      items: {
        create: [
          {
            name: 'Catering Package',
            quantity: 1,
            price: 1000.0,
            category: ItemCategory.FOOD,
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
