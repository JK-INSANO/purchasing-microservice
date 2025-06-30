import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus, DeliveryMethod } from '../enums/order.enum';
import { IOrder } from '../interfaces/order.interface';
import { OrderItemDto, CustomerInfoDto } from './create-order.dto';

export class OrderResponseDto implements IOrder {
  @ApiProperty({ description: 'ID del pedido' })
  id: string;

  @ApiProperty({ description: 'ID del usuario que realizó el pedido' })
  userId: string;

  @ApiPropertyOptional({ description: 'ID del repartidor asignado' })
  deliveryId?: string;

  @ApiProperty({
    description: 'Productos en el pedido',
    type: [OrderItemDto]
  })
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Información del cliente',
    type: CustomerInfoDto
  })
  customer: CustomerInfoDto;

  @ApiProperty({ description: 'Total del pedido' })
  total: number;

  @ApiProperty({
    description: 'Estado del pedido',
    enum: OrderStatus
  })
  status: OrderStatus;

  @ApiProperty({
    description: 'Método de entrega',
    enum: DeliveryMethod
  })
  deliveryMethod: DeliveryMethod;

  @ApiPropertyOptional({ description: 'Dirección de entrega' })
  deliveryAddress?: string;

  @ApiPropertyOptional({ description: 'Fecha de entrega' })
  deliveryDate?: Date;

  @ApiPropertyOptional({ description: 'Notas adicionales' })
  notes?: string;

  @ApiProperty({ description: 'Fecha de creación' })
  createdAt?: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  updatedAt?: Date;
}

export class PaginatedOrdersResponseDto {
  @ApiProperty({
    description: 'Lista de pedidos',
    type: [OrderResponseDto]
  })
  orders: OrderResponseDto[];

  @ApiProperty({ description: 'Total de pedidos' })
  total: number;

  @ApiProperty({ description: 'Página actual' })
  page: number;

  @ApiProperty({ description: 'Elementos por página' })
  limit: number;

  @ApiProperty({ description: 'Total de páginas' })
  totalPages: number;
}

export class OrderStatsResponseDto {
  @ApiProperty({ description: 'Total de pedidos' })
  total: number;

  @ApiProperty({ description: 'Pedidos pendientes' })
  pending: number;

  @ApiProperty({ description: 'Pedidos confirmados' })
  confirmed: number;

  @ApiProperty({ description: 'Pedidos en preparación' })
  preparing: number;

  @ApiProperty({ description: 'Pedidos listos para recoger' })
  readyForPickup: number;

  @ApiProperty({ description: 'Pedidos recogidos' })
  pickedUp: number;

  @ApiProperty({ description: 'Pedidos en tránsito' })
  inTransit: number;

  @ApiProperty({ description: 'Pedidos entregados' })
  delivered: number;

  @ApiProperty({ description: 'Pedidos cancelados' })
  cancelled: number;

  @ApiProperty({ description: 'Total gastado' })
  totalSpent?: number;
}

export class CancelOrderResponseDto {
  @ApiProperty({ description: 'Mensaje de confirmación' })
  message: string;

  @ApiProperty({
    description: 'Pedido cancelado',
    type: OrderResponseDto
  })
  order: OrderResponseDto;
}
