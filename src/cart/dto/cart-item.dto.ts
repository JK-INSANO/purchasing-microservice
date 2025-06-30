import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CartItemDto {
  @ApiProperty({ 
    description: 'ID del producto',
    example: '507f1f77bcf86cd799439011'
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ 
    description: 'Nombre del producto',
    example: 'Laptop Dell XPS 13'
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ 
    description: 'Precio unitario del producto',
    example: 1299.99,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ 
    description: 'Cantidad del producto',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    description: 'ID de la tienda del producto',
    example: '507f1f77bcf86cd799439012'
  })
  @IsString()
  @IsNotEmpty()
  storeId: string;

  @ApiProperty({ 
    description: 'Nombre de la tienda',
    example: 'TechStore'
  })
  @IsString()
  @IsNotEmpty()
  storeName: string;

  @ApiProperty({ 
    description: 'URL de la imagen del producto',
    example: 'https://example.com/image.jpg',
    required: false
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;
}