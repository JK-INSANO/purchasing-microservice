import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OrderStatus, DeliveryMethod } from '../enums/order.enum';
import { IOrderItem, ICustomerInfo } from '../interfaces/order.interface';

@Schema({ _id: false })
export class OrderItem implements IOrderItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, index: true })
  storeId: string;

  @Prop({ required: true })
  storeName: string;

  @Prop({ required: false })
  imageUrl?: string;
}

@Schema({ _id: false })
export class CustomerInfo implements ICustomerInfo {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  email?: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: false })
  address?: string;
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: false, index: true })
  deliveryId?: string;

  @Prop({
    required: true,
    type: [OrderItem],
  })
  items: OrderItem[];

  @Prop({
    required: true,
    type: CustomerInfo,
  })
  customer: CustomerInfo;

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({
    required: true,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
    index: true
  })
  status: OrderStatus;

  @Prop({
    required: true,
    enum: DeliveryMethod
  })
  deliveryMethod: DeliveryMethod;

  @Prop({ required: false })
  deliveryAddress?: string;

  @Prop({ required: false, type: Date })
  deliveryDate?: Date;

  @Prop({ required: false })
  notes?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Índices compuestos
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ 'items.storeId': 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });


