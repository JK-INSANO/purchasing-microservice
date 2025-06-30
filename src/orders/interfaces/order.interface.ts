import { Document } from 'mongoose';
import { OrderStatus, DeliveryMethod } from '../enums/order.enum';

export interface IOrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  storeId: string;
  storeName: string;
  imageUrl?: string;
}

export interface ICustomerInfo {
  name: string;
  email?: string;
  phone: string;
  address?: string;
}

export interface IOrder {
  id: string;
  userId: string;
  deliveryId?: string;
  items: IOrderItem[];
  customer: ICustomerInfo;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  deliveryDate?: Date;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends Document {
  userId: string;
  deliveryId?: string;
  items: IOrderItem[];
  customer: ICustomerInfo;
  total: number;
  status: OrderStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  deliveryDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderRepository {
  create(orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder>;
  findById(id: string): Promise<IOrder | null>;
  findByUserId(userId: string, query?: any): Promise<[IOrder[], number]>;
  findByStoreId(storeId: string, query?: any): Promise<[IOrder[], number]>;
  update(id: string, updateData: Partial<IOrder>): Promise<IOrder | null>;
  delete(id: string): Promise<boolean>;
  findWithPagination(filters: any, page: number, limit: number): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
  getOrderStats(filters: any): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    readyForPickup: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  }>;
  calculateTotalSpent(filters: any): Promise<number>;
}
