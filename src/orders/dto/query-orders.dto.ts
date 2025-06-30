import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsDateString,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { OrderStatus, DeliveryMethod } from '../enums/order.enum';

export class QueryOrdersDto {
  @ApiPropertyOptional({ 
    description: 'Número de página',
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    description: 'Número de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filtrar por estado del pedido',
    enum: OrderStatus,
    example: OrderStatus.PENDING
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por método de entrega',
    enum: DeliveryMethod,
    example: DeliveryMethod.DELIVERY
  })
  @IsOptional()
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod;

  @ApiPropertyOptional({
    description: 'Fecha de inicio para filtrar pedidos (formato ISO)',
    example: '2024-01-01T00:00:00Z'
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin para filtrar pedidos (formato ISO)',
    example: '2024-12-31T23:59:59Z'
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Monto mínimo del pedido',
    example: 100,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @ApiPropertyOptional({
    description: 'Monto máximo del pedido',
    example: 1000,
    minimum: 0
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxAmount?: number;

  @ApiPropertyOptional({
    description: 'Ordenar por campo (orderDate, total)',
    example: 'orderDate',
    default: 'orderDate'
  })
  @IsOptional()
  @Transform(({ value }) => value || 'orderDate')
  sort_by?: string = 'orderDate';

  @ApiPropertyOptional({
    description: 'Orden de clasificación (asc, desc)',
    example: 'desc',
    default: 'desc'
  })
  @IsOptional()
  @Transform(({ value }) => value || 'desc')
  sort_order?: 'asc' | 'desc' = 'desc';
}
