import { ApiProperty } from '@nestjs/swagger';

export class CartItemResponseDto {
  @ApiProperty({ description: 'ID del producto' })
  productId: string;

  @ApiProperty({ description: 'Nombre del producto' })
  name: string;

  @ApiProperty({ description: 'Precio unitario del producto' })
  price: number;

  @ApiProperty({ description: 'Cantidad del producto' })
  quantity: number;

  @ApiProperty({ description: 'ID de la tienda del producto' })
  storeId: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  storeName: string;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  imageUrl?: string;

  @ApiProperty({ description: 'Subtotal del item (precio * cantidad)' })
  subtotal: number;
}

export class CartResponseDto {
  @ApiProperty({ description: 'ID del carrito' })
  id: string;

  @ApiProperty({ description: 'ID del usuario propietario del carrito' })
  userId: string;

  @ApiProperty({ 
    description: 'Items en el carrito',
    type: [CartItemResponseDto]
  })
  items: CartItemResponseDto[];

  @ApiProperty({ description: 'ID de la tienda principal', required: false })
  primaryStoreId?: string;

  @ApiProperty({ description: 'Nombre de la tienda principal', required: false })
  primaryStoreName?: string;

  @ApiProperty({ description: 'Total de items en el carrito' })
  totalItems: number;

  @ApiProperty({ description: 'Precio total del carrito' })
  totalPrice: number;

  @ApiProperty({ description: 'Indica si hay productos de diferentes tiendas' })
  hasMixedStores: boolean;

  @ApiProperty({ description: 'Lista de tiendas diferentes en el carrito' })
  stores: Array<{ storeId: string; storeName: string; itemCount: number }>;

  @ApiProperty({ description: 'Fecha de última actividad' })
  lastActivity: Date;

  @ApiProperty({ description: 'Fecha de creación del carrito' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización del carrito' })
  updatedAt: Date;
}

export class CartSummaryDto {
  @ApiProperty({ description: 'Total de items en el carrito' })
  totalItems: number;

  @ApiProperty({ description: 'Precio total del carrito' })
  totalPrice: number;

  @ApiProperty({ description: 'Número de productos únicos' })
  uniqueProducts: number;

  @ApiProperty({ description: 'Indica si el carrito está vacío' })
  isEmpty: boolean;
}
