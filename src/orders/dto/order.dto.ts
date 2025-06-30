import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { 
  IsString, IsNumber, IsArray, IsEnum, IsNotEmpty, 
  ValidateNested, Min, IsOptional, IsObject
} from 'class-validator';
import { DeliveryMethod } from '../enums/order.enum';

export class OrderItemDto {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'ID de la tienda del producto' })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}

export class CustomerInfoDto {
  @ApiProperty({ description: 'Nombre del cliente' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ description: 'Email del cliente' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Dirección del cliente' })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Información del cliente' })
  @IsObject()
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @ApiProperty({ description: 'Items del pedido', type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'Total del pedido' })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({ description: 'Método de entrega', enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiProperty({ description: 'Notas adicionales del pedido', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

