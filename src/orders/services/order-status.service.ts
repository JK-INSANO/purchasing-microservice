import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderStatus } from '../enums/order.enum';
import { IOrder } from '../interfaces/order.interface';

@Injectable()
export class OrderStatusService {
  // Definir las transiciones válidas para cada rol
  private readonly storeTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.DELIVERED], // Permitir cambiar a DELIVERED directamente
    [OrderStatus.PICKED_UP]: [OrderStatus.DELIVERED], // También permitir desde PICKED_UP
    [OrderStatus.IN_TRANSIT]: [],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  private readonly deliveryTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [],
    [OrderStatus.CONFIRMED]: [],
    [OrderStatus.PREPARING]: [],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.PICKED_UP],
    [OrderStatus.PICKED_UP]: [OrderStatus.IN_TRANSIT],
    [OrderStatus.IN_TRANSIT]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  private readonly customerTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
    [OrderStatus.CONFIRMED]: [OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [],
    [OrderStatus.READY_FOR_PICKUP]: [],
    [OrderStatus.PICKED_UP]: [],
    [OrderStatus.IN_TRANSIT]: [],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  };

  validateStatusTransition(
    order: IOrder,
    newStatus: OrderStatus,
    userId: string,
    role: 'store' | 'delivery' | 'customer'
  ): void {
    // Verificar permisos según el rol
    if (role === 'store') {
      // Verificar que el pedido pertenece a la tienda
      const storeHasOrder = order.items.some(item => item.storeId === userId);
      if (!storeHasOrder) {
        throw new ForbiddenException('No tienes permiso para actualizar este pedido');
      }
      
      // Verificar transiciones válidas para la tienda
      if (!this.storeTransitions[order.status].includes(newStatus)) {
        throw new BadRequestException(`No se puede cambiar el estado de ${order.status} a ${newStatus}`);
      }
      
      // Verificación adicional para pedidos de recogida en tienda
      if (newStatus === OrderStatus.DELIVERED && order.deliveryMethod === 'PICKUP' && 
          order.status === OrderStatus.READY_FOR_PICKUP) {
        // Permitir la transición directa a DELIVERED para pedidos de recogida en tienda
        return;
      }
    } else if (role === 'delivery') {
      // Verificar que el repartidor está asignado al pedido
      if (order.deliveryId !== userId) {
        throw new ForbiddenException('No estás asignado a este pedido');
      }
      
      // Verificar transiciones válidas para el repartidor
      if (!this.deliveryTransitions[order.status].includes(newStatus)) {
        throw new BadRequestException(`No se puede cambiar el estado de ${order.status} a ${newStatus}`);
      }
    } else if (role === 'customer') {
      // Verificar que el pedido pertenece al cliente
      if (order.userId !== userId) {
        throw new ForbiddenException('No tienes permiso para actualizar este pedido');
      }
      
      // Verificar transiciones válidas para el cliente
      if (!this.customerTransitions[order.status].includes(newStatus)) {
        throw new BadRequestException(`No se puede cambiar el estado de ${order.status} a ${newStatus}`);
      }
    }
  }
}
