import { prisma } from '@/lib/db';
import type { Prisma } from '@prisma/client';


import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Orders | ISFC Dashboard',
  description: 'View and manage your event orders'
};

interface OrderData {
  id: string;
  event: string;
  date: Date;
  time: string | null;
  guests: number;
  status: string;
  total: number;
  requirements: string[];
  createdAt: Date;
  customer: {
    name: string;
    email: string;
    phone: string | null;
  };
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    category: string;
  }[];
  escalations: {
    id: string;
    status: string;
  }[];
};

async function getOrders(): Promise<OrderData[]> {
  try {
    type PrismaOrder = Prisma.OrderGetPayload<{
      include: {
        customer: true;
        items: true;
        escalations: true;
      };
    }>;

    const orders = await prisma.order.findMany({
      include: {
        customer: true,
        items: true,
        escalations: {
          where: {
            status: 'OPEN'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }) as PrismaOrder[];

    return orders.map((order) => ({
      id: order.id,
      event: order.event,
      date: order.date,
      time: order.time,
      guests: order.guests,
      status: order.status,
      total: order.total,
      requirements: order.requirements,
      createdAt: order.createdAt,
      customer: {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone
      },
      items: order.items.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        category: item.category
      })),
      escalations: order.escalations.map(esc => ({
        id: esc.id,
        status: esc.status
      }))
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Orders</h1>
        <a
          href="/orders/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white"
        >
          New Order
        </a>
      </div>
      <div className="overflow-x-auto rounded-lg shadow-lg bg-gray-800">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-700">
              <th className="px-4 py-3 text-left">Order ID</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Event</th>
              <th className="px-4 py-3 text-left">Items</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders?.map((order: OrderData) => (
              <tr key={order.id} className="border-b border-gray-700 hover:bg-gray-700 transition">
                <td className="px-4 py-3">{order.id}</td>
                <td className="px-4 py-3">
                  <div>
                    <div>{order.customer.name}</div>
                    <div className="text-xs text-gray-400">{order.customer.email}</div>
                    {order.customer.phone && (
                      <div className="text-xs text-gray-400">{order.customer.phone}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div>{order.event}</div>
                    <div className="text-xs text-gray-400">{order.guests} guests</div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {order.items.map(item => (
                    <div key={item.id} className="text-sm mb-1">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-gray-400"> × {item.quantity}</span>
                      <span className="text-xs text-gray-500 ml-1">({item.category})</span>
                    </div>
                  ))}
                </td>
                <td className="px-4 py-3">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={getStatusColor(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div>
                    <div>{new Date(order.date).toLocaleDateString()}</div>
                    {order.time && (
                      <div className="text-xs text-gray-400">{order.time}</div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orders?.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING':
      return 'text-yellow-400';
    case 'CONFIRMED':
      return 'text-blue-400';
    case 'IN_PROGRESS':
      return 'text-green-400';
    case 'COMPLETED':
      return 'text-green-500';
    case 'CANCELLED':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
}