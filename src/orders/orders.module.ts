import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersController } from './orders.controller';
import { OrdersService } from './services/orders.service';
import { OrderStatusService } from './services/order-status.service';
import { OrderRepository } from './repositories/order.repository';
import { Order, OrderSchema } from './schemas/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema }
    ])
  ],
  controllers: [OrdersController],
  providers: [
    OrdersService,
    OrderStatusService,
    OrderRepository
  ],
  exports: [OrdersService]
})
export class OrdersModule {}

