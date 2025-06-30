import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto } from './cart-item.dto';

export class SyncCartDto {
  @ApiProperty({
    description: 'Items del carrito local',
    type: [CartItemDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];

  @ApiPropertyOptional({
    description: 'ID de la tienda principal',
    example: 'store123'
  })
  @IsOptional()
  @IsString()
  primaryStoreId?: string;

  @ApiPropertyOptional({
    description: 'Nombre de la tienda principal',
    example: 'TiendaPro'
  })
  @IsOptional()
  @IsString()
  primaryStoreName?: string;
}