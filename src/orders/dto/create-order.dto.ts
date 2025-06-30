import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDate,
  ValidateNested,
  IsArray,
  Min,
  IsUrl,
  IsEmail,
} from 'class-validator';
import { DeliveryMethod } from '../enums/order.enum';
import { IOrderItem, ICustomerInfo } from '../interfaces/order.interface';

export class OrderItemDto implements IOrderItem {
  @ApiProperty({ description: 'ID del producto' })
  @IsString()
  productId: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ description: 'Cantidad del producto' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ description: 'ID de la tienda' })
  @IsString()
  storeId: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  @IsString()
  storeName: string;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  @IsOptional()
  @IsUrl()
  imageUrl?: string;
}

export class CustomerInfoDto implements ICustomerInfo {
  @ApiProperty({ description: 'Nombre completo del cliente' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Email del cliente', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Teléfono del cliente' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Dirección del cliente', required: false })
  @IsOptional()
  @IsString()
  address?: string;
}

export class CreateOrderDto {
  @ApiProperty({
    description: 'Productos en el pedido',
    type: [OrderItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({
    description: 'Información del cliente',
    type: CustomerInfoDto
  })
  @ValidateNested()
  @Type(() => CustomerInfoDto)
  customer: CustomerInfoDto;

  @ApiProperty({ description: 'Total del pedido' })
  @IsNumber()
  @Min(0)
  total: number;

  @ApiProperty({
    description: 'Método de entrega',
    enum: DeliveryMethod
  })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  @ApiProperty({ description: 'Dirección de entrega (requerida para delivery)', required: false })
  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @ApiProperty({ description: 'Fecha de entrega deseada', required: false })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  deliveryDate?: Date;

  @ApiProperty({ description: 'Notas adicionales', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
