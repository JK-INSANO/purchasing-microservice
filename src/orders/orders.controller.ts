import { Controller, Post, Body, Headers, BadRequestException, Get, Param, Query, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBadRequestResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './services/orders.service';
import { CreateOrderDto } from './dto/order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { QueryStoreOrdersDto } from './dto/query-store-orders.dto';
import { OrderStatus } from './enums/order.enum';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({
    summary: 'Crear un nuevo pedido',
    description: 'Crea un nuevo pedido con los productos especificados'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente'
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos o header x-user-id requerido'
  })
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Obtener pedidos del usuario',
    description: 'Obtiene los pedidos del usuario con filtros y paginación'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos obtenida exitosamente'
  })
  async getUserOrders(
    @Headers('x-user-id') userId: string,
    @Query() queryOrdersDto: QueryOrdersDto,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    const { orders, total, page, limit, totalPages } = await this.ordersService.findByUserId(userId, queryOrdersDto);
    
    // Formato compatible con el frontend
    return {
      data: orders,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalles de un pedido',
    description: 'Obtiene los detalles de un pedido específico'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del pedido obtenidos exitosamente'
  })
  async getOrderDetails(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    return this.ordersService.findById(orderId, userId);
  }

  @Get('store/:storeId')
  @ApiOperation({
    summary: 'Obtener pedidos de una tienda',
    description: 'Obtiene los pedidos asociados a una tienda específica'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario (tienda)',
    required: true,
  })
  @ApiParam({ name: 'storeId', description: 'ID de la tienda' })
  @ApiQuery({ name: 'page', description: 'Número de página', required: false })
  @ApiQuery({ name: 'limit', description: 'Elementos por página', required: false })
  @ApiQuery({ name: 'status', description: 'Filtrar por estado', required: false })
  async getStoreOrders(
    @Param('storeId') storeId: string,
    @Headers('x-user-id') userId: string,
    @Query() queryParams: Omit<QueryStoreOrdersDto, 'storeId'>,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    // Verificar permisos (opcional)
    // this.ordersService.verifyStoreAccess(userId, storeId);
    
    const { orders, total, page, limit, totalPages } = await this.ordersService.findByStoreId(
      storeId, 
      queryParams
    );
    
    // Formato compatible con el frontend
    return {
      data: orders,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  @Get('store/:storeId/stats')
  @ApiOperation({
    summary: 'Obtener estadísticas de pedidos de una tienda',
    description: 'Obtiene estadísticas de los pedidos asociados a una tienda específica'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario (tienda)',
    required: true,
  })
  @ApiParam({ name: 'storeId', description: 'ID de la tienda' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas obtenidas exitosamente'
  })
  async getStoreOrderStats(
    @Param('storeId') storeId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    // Verificar permisos (opcional)
    // this.ordersService.verifyStoreAccess(userId, storeId);
    
    const stats = await this.ordersService.getStoreOrderStats(storeId);
    
    return {
      totalOrders: stats.total,
      pendingOrders: stats.pending,
      processingOrders: stats.confirmed + stats.preparing,
      readyOrders: stats.readyForPickup,
      deliveredOrders: stats.delivered,
      cancelledOrders: stats.cancelled,
      totalRevenue: await this.ordersService.calculateTotalRevenue(storeId)
    };
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Cancelar un pedido',
    description: 'Cancela un pedido existente (solo si está en estado pendiente)'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido cancelado exitosamente'
  })
  async cancelOrder(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    return this.ordersService.cancelOrder(orderId, userId);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Actualizar estado de un pedido',
    description: 'Actualiza el estado de un pedido existente'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario (tienda)',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Estado del pedido actualizado exitosamente'
  })
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Headers('x-user-id') userId: string,
    @Body() body: { status: OrderStatus },
  ) {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    // Obtener el pedido para verificar si es de recogida en tienda
    const order = await this.ordersService.findById(orderId, userId);
    
    // Actualizar el estado del pedido
    return this.ordersService.updateOrderStatus(orderId, body.status, userId, 'store');
  }

  @Get('delivery/available')
  @ApiOperation({
    summary: 'Obtener pedidos disponibles para entrega',
    description: 'Obtiene los pedidos que están listos para ser entregados y no tienen repartidor asignado'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del repartidor',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos disponibles obtenida exitosamente'
  })
  async getAvailableDeliveryOrders(
    @Headers('x-user-id') deliveryId: string,
    @Query() queryParams: QueryOrdersDto,
  ) {
    if (!deliveryId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    const { orders, total, page, limit, totalPages } = await this.ordersService.findAvailableForDelivery(queryParams);
    
    return {
      data: orders,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  @Get('delivery/assigned')
  @ApiOperation({
    summary: 'Obtener pedidos asignados al repartidor',
    description: 'Obtiene los pedidos que están asignados al repartidor actual'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del repartidor',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos asignados obtenida exitosamente'
  })
  async getAssignedDeliveryOrders(
    @Headers('x-user-id') deliveryId: string,
    @Query() queryParams: QueryOrdersDto,
  ) {
    if (!deliveryId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    const { orders, total, page, limit, totalPages } = await this.ordersService.findByDeliveryId(deliveryId, queryParams);
    
    return {
      data: orders,
      pagination: {
        totalItems: total,
        totalPages: totalPages,
        currentPage: page,
        itemsPerPage: limit
      }
    };
  }

  @Patch(':id/assign')
  @ApiOperation({
    summary: 'Asignar pedido a repartidor',
    description: 'Asigna un pedido al repartidor actual'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del repartidor',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Pedido asignado exitosamente'
  })
  async assignDeliveryOrder(
    @Param('id') orderId: string,
    @Headers('x-user-id') deliveryId: string,
  ) {
    if (!deliveryId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    return this.ordersService.assignDelivery(orderId, deliveryId);
  }

  @Patch(':id/delivery-status')
  @ApiOperation({
    summary: 'Actualizar estado de entrega',
    description: 'Actualiza el estado de un pedido asignado al repartidor'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del repartidor',
    required: true,
  })
  @ApiParam({ name: 'id', description: 'ID del pedido' })
  @ApiResponse({
    status: 200,
    description: 'Estado del pedido actualizado exitosamente'
  })
  async updateDeliveryStatus(
    @Param('id') orderId: string,
    @Headers('x-user-id') deliveryId: string,
    @Body() body: { status: OrderStatus },
  ) {
    if (!deliveryId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    
    return this.ordersService.updateOrderStatus(orderId, body.status, deliveryId, 'delivery');
  }
}

