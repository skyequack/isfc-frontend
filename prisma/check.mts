import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        include: {
          items: true,
          escalations: true
        }
      }
    }
  });
  
  console.log('Seeded data:');
  console.log(JSON.stringify(customers, null, 2));
}

main()
  .catch((e) => {
    console.error('Error checking data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
