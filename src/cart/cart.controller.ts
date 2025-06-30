import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemToCartDto, UpdateCartItemDto, CartResponseDto, CartSummaryDto} from './dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Obtener carrito del usuario',
    description: 'Obtiene el carrito de compras del usuario'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito obtenido exitosamente',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido',
  })
  async getCart(@Headers('x-user-id') userId: string): Promise<CartResponseDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.getCart(userId);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Obtener resumen del carrito',
    description: 'Obtiene un resumen básico del carrito (totales, cantidad de productos, etc.)'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del carrito obtenido exitosamente',
    type: CartSummaryDto,
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido',
  })
  async getCartSummary(@Headers('x-user-id') userId: string): Promise<CartSummaryDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.getCartSummary(userId);
  }

  @Post('items')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Agregar producto al carrito',
    description: 'Agrega un producto al carrito del usuario. Si el producto ya existe, incrementa la cantidad.'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Producto agregado al carrito exitosamente',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Datos inválidos, header x-user-id requerido o intento de agregar productos de diferentes tiendas',
  })
  async addItem(
    @Body() addItemDto: AddItemToCartDto,
    @Headers('x-user-id') userId: string,
  ): Promise<CartResponseDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.addItem(userId, addItemDto);
  }

  @Put('items/:productId')
  @ApiOperation({
    summary: 'Actualizar cantidad de producto en el carrito',
    description: 'Actualiza la cantidad de un producto específico en el carrito'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto a actualizar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad del producto actualizada exitosamente',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado en el carrito',
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido',
  })
  async updateItem(
    @Param('productId') productId: string,
    @Body() updateItemDto: UpdateCartItemDto,
    @Headers('x-user-id') userId: string,
  ): Promise<CartResponseDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.updateItem(userId, productId, updateItemDto);
  }

  @Delete('items/:productId')
  @ApiOperation({
    summary: 'Eliminar producto del carrito',
    description: 'Elimina un producto específico del carrito'
  })
  @ApiParam({
    name: 'productId',
    description: 'ID del producto a eliminar',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Producto eliminado del carrito exitosamente',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Producto no encontrado en el carrito',
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido',
  })
  async removeItem(
    @Param('productId') productId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<CartResponseDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.removeItem(userId, productId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Vaciar carrito',
    description: 'Elimina todos los productos del carrito del usuario'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito vaciado exitosamente',
    type: CartResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Carrito no encontrado',
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido',
  })
  async clearCart(@Headers('x-user-id') userId: string): Promise<CartResponseDto> {
    if (!userId) {
      throw new BadRequestException('Header x-user-id es requerido');
    }
    return this.cartService.clearCart(userId);
  }

  @Post('sync')
  @ApiOperation({
    summary: 'Sincronizar carrito local con backend',
    description: 'Sincroniza los items del carrito local con el backend'
  })
  @ApiHeader({
    name: 'x-user-id',
    description: 'ID del usuario',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Carrito sincronizado exitosamente',
    type: CartResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Header x-user-id es requerido o datos inválidos',
  })
  async syncCart(
    @Body() syncCartDto: SyncCartDto,
    @Headers('x-user-id') userId: string,
  ): Promise<CartResponseDto> {
    try {
      if (!userId) {
        throw new BadRequestException('Header x-user-id es requerido');
      }
      
      // Validar que los items tengan la estructura correcta
      if (!syncCartDto.items || !Array.isArray(syncCartDto.items)) {
        throw new BadRequestException('El campo items debe ser un array');
      }
      
      // Validar cada item
      for (const item of syncCartDto.items) {
        if (!item.productId || !item.name || !item.storeId || !item.storeName) {
          throw new BadRequestException('Todos los items deben tener productId, name, storeId y storeName');
        }
        
        if (typeof item.price !== 'number' || item.price < 0) {
          throw new BadRequestException('El precio debe ser un número mayor o igual a 0');
        }
        
        if (typeof item.quantity !== 'number' || item.quantity < 1) {
          throw new BadRequestException('La cantidad debe ser un número mayor o igual a 1');
        }
      }
      
      return this.cartService.syncCart(userId, syncCartDto);
    } catch (error) {
      console.error('Error en syncCart controller:', error);
      throw error;
    }
  }
}


