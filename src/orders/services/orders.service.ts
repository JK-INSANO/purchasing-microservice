import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { OrderRepository } from '../repositories/order.repository';
import { CreateOrderDto } from '../dto/order.dto';
import { OrderStatus, DeliveryMethod } from '../enums/order.enum';
import { QueryOrdersDto } from '../dto/query-orders.dto';
import { QueryStoreOrdersDto } from '../dto/query-store-orders.dto';
import { OrderStatusService } from './order-status.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderStatusService: OrderStatusService
  ) {}

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    // Crear el objeto de orden a partir del DTO
    const orderData = {
      userId,
      items: createOrderDto.items,
      customer: createOrderDto.customer,
      total: createOrderDto.total,
      deliveryMethod: createOrderDto.deliveryMethod,
      notes: createOrderDto.notes,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Guardar la orden en la base de datos
    return this.orderRepository.create(orderData);
  }

  async findByUserId(userId: string, queryParams: QueryOrdersDto) {
    const { page = 1, limit = 10, status, deliveryMethod, startDate, endDate, minAmount, maxAmount, sort_by, sort_order } = queryParams;
    
    // Construir filtros
    const filters: any = { userId };
    
    if (status) filters.status = status;
    if (deliveryMethod) filters.deliveryMethod = deliveryMethod;
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    if (minAmount || maxAmount) {
      filters.total = {};
      if (minAmount) filters.total.$gte = minAmount;
      if (maxAmount) filters.total.$lte = maxAmount;
    }
    
    // Obtener órdenes con paginación
    return this.orderRepository.findWithPagination(filters, page, limit);
  }

  async findById(id: string, userId: string) {
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    
    // Verificar que el pedido pertenece al usuario o a una tienda asociada
    const userIsOwner = order.userId === userId;
    const userIsStoreOwner = order.items.some(item => item.storeId === userId);
    
    if (!userIsOwner && !userIsStoreOwner) {
      throw new ForbiddenException('No tienes permiso para ver este pedido');
    }
    
    return order;
  }

  async findByStoreId(storeId: string, queryParams: Omit<QueryStoreOrdersDto, 'storeId'>) {
    const { page = 1, limit = 10, status, deliveryMethod, startDate, endDate } = queryParams;
    
    // Construir filtros
    const filters: any = { 'items.storeId': storeId };
    
    if (status) filters.status = status;
    if (deliveryMethod) filters.deliveryMethod = deliveryMethod;
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    // Obtener órdenes con paginación
    return this.orderRepository.findWithPagination(filters, page, limit);
  }

  async cancelOrder(id: string, userId: string) {
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    
    // Verificar que el pedido pertenece al usuario
    if (order.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para cancelar este pedido');
    }
    
    // Verificar que el pedido está en un estado que permite cancelación
    this.orderStatusService.validateStatusTransition(order, OrderStatus.CANCELLED, userId, 'customer');
    
    // Actualizar el estado del pedido
    return this.orderRepository.update(id, { status: OrderStatus.CANCELLED });
  }

  async updateOrderStatus(id: string, newStatus: OrderStatus, userId: string, role: 'store' | 'delivery' | 'customer') {
    const order = await this.orderRepository.findById(id);
    
    if (!order) {
      throw new NotFoundException(`Pedido con ID ${id} no encontrado`);
    }
    
    // Verificar que la transición de estado es válida
    this.orderStatusService.validateStatusTransition(order, newStatus, userId, role);
    
    // Actualizar el estado del pedido
    return this.orderRepository.update(id, { status: newStatus });
  }

  async getStoreOrderStats(storeId: string) {
    const filter = { 'items.storeId': storeId };
    return this.orderRepository.getOrderStats(filter);
  }

  async calculateTotalRevenue(storeId: string) {
    const filter = { 
      'items.storeId': storeId,
      status: { $nin: [OrderStatus.CANCELLED] }
    };
    return this.orderRepository.calculateTotalSpent(filter);
  }
}





