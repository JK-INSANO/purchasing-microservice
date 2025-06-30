import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from '../schemas/order.schema';
import { IOrder, IOrderRepository } from '../interfaces/order.interface';

@Injectable()
export class OrderRepository implements IOrderRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>
  ) {}

  async findWithPagination(filters: any, page: number, limit: number): Promise<{
    orders: IOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filters).exec(),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.mapToOrder(order)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  // Método para mapear el documento de MongoDB a la interfaz IOrder
  private mapToOrder(orderDoc: any): IOrder {
    return {
      id: orderDoc._id.toString(),
      userId: orderDoc.userId,
      items: orderDoc.items,
      customer: orderDoc.customer,
      total: orderDoc.total,
      status: orderDoc.status,
      deliveryMethod: orderDoc.deliveryMethod,
      deliveryAddress: orderDoc.deliveryAddress,
      deliveryDate: orderDoc.deliveryDate,
      notes: orderDoc.notes,
      createdAt: orderDoc.createdAt,
      updatedAt: orderDoc.updatedAt
    };
  }

  async create(orderData: Omit<IOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<IOrder> {
    const newOrder = new this.orderModel(orderData);
    const savedOrder = await newOrder.save();
    return this.mapToOrder(savedOrder);
  }

  async findById(id: string): Promise<IOrder | null> {
    const order = await this.orderModel.findById(id).exec();
    return order ? this.mapToOrder(order) : null;
  }

  async findByUserId(userId: string, query?: any): Promise<[IOrder[], number]> {
    const filters = { userId, ...query };
    const [orders, count] = await Promise.all([
      this.orderModel.find(filters).sort({ createdAt: -1 }).exec(),
      this.orderModel.countDocuments(filters).exec()
    ]);
    return [orders.map(order => this.mapToOrder(order)), count];
  }

  async findByStoreId(storeId: string, query?: any): Promise<[IOrder[], number]> {
    const filters = { 'items.storeId': storeId, ...query };
    const [orders, count] = await Promise.all([
      this.orderModel.find(filters).sort({ createdAt: -1 }).exec(),
      this.orderModel.countDocuments(filters).exec()
    ]);
    return [orders.map(order => this.mapToOrder(order)), count];
  }

  async update(id: string, updateData: Partial<IOrder>): Promise<IOrder | null> {
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    ).exec();
    return updatedOrder ? this.mapToOrder(updatedOrder) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async getOrderStats(filters: any): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    preparing: number;
    readyForPickup: number;
    pickedUp: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  }> {
    const stats = await this.orderModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).exec();

    const result = {
      total: 0,
      pending: 0,
      confirmed: 0,
      preparing: 0,
      readyForPickup: 0,
      pickedUp: 0,
      inTransit: 0,
      delivered: 0,
      cancelled: 0
    };

    // Calcular el total
    result.total = await this.orderModel.countDocuments(filters).exec();

    // Asignar conteos por estado
    stats.forEach((stat: any) => {
      const status = stat._id.toLowerCase();
      if (status in result) {
        result[status as keyof typeof result] = stat.count;
      }
    });

    return result;
  }

  async calculateTotalSpent(filters: any): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]).exec();

    return result.length > 0 ? result[0].total : 0;
  }
}

