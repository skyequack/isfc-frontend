import { ItemCategory, OrderStatus } from './enums';

export interface CreateOrderItem {
  name: string;
  quantity: number;
  price: number;
  category: ItemCategory;
}

export interface CreateOrderRequest {
  customerId: string;
  event: string;
  date: Date;
  time: string;
  guests: number;
  status: OrderStatus;
  total: number;
  requirements: string[];
  items: CreateOrderItem[];
}
