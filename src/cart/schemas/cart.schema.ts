import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type CartDocument = Cart & Document;

export class CartItem {
  @ApiProperty({ description: 'ID del producto' })
  @Prop({ required: true })
  productId: string;

  @ApiProperty({ description: 'Nombre del producto' })
  @Prop({ required: true })
  name: string;

  @ApiProperty({ description: 'Precio unitario del producto' })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Cantidad del producto' })
  @Prop({ required: true, min: 1 })
  quantity: number;

  @ApiProperty({ description: 'ID de la tienda del producto' })
  @Prop({ required: true })
  storeId: string;

  @ApiProperty({ description: 'Nombre de la tienda' })
  @Prop({ required: true })
  storeName: string;

  @ApiProperty({ description: 'URL de la imagen del producto', required: false })
  @Prop({ required: false })
  imageUrl?: string;
}

@Schema({ timestamps: true })
export class Cart {
  @ApiProperty({ description: 'ID del usuario propietario del carrito' })
  @Prop({ required: true, index: true })
  userId: string;

  @ApiProperty({ 
    description: 'Items en el carrito',
    type: [CartItem]
  })
  @Prop({ 
    required: true,
    type: [{
      productId: { type: String, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true, min: 0 },
      quantity: { type: Number, required: true, min: 1 },
      storeId: { type: String, required: true },
      storeName: { type: String, required: true },
      imageUrl: { type: String, required: false }
    }],
    default: []
  })
  items: CartItem[];

  @ApiProperty({ description: 'ID de la tienda principal (si todos los productos son de la misma tienda)', required: false })
  @Prop({ required: false })
  primaryStoreId?: string;

  @ApiProperty({ description: 'Nombre de la tienda principal', required: false })
  @Prop({ required: false })
  primaryStoreName?: string;

  @ApiProperty({ description: 'Total de items en el carrito' })
  @Prop({ required: true, default: 0 })
  totalItems: number;

  @ApiProperty({ description: 'Precio total del carrito' })
  @Prop({ required: true, default: 0 })
  totalPrice: number;

  @ApiProperty({ description: 'Fecha de última actividad' })
  @Prop({ required: true, default: Date.now })
  lastActivity: Date;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  createdAt?: Date;

  @ApiProperty({ description: 'Fecha de última actualización del registro' })
  updatedAt?: Date;
}

export const CartSchema = SchemaFactory.createForClass(Cart);

// Índices para mejorar el rendimiento
CartSchema.index({ userId: 1 }, { unique: true });
CartSchema.index({ lastActivity: 1 });
CartSchema.index({ 'items.productId': 1 });
CartSchema.index({ 'items.storeId': 1 });

// TTL index para carritos abandonados (30 días)
CartSchema.index({ lastActivity: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Eliminar o modificar este índice
// CartSchema.index({ sessionId: 1 }, { unique: true });

// O si necesitas mantener sessionId, pero no como único cuando es null:
CartSchema.index({ sessionId: 1 }, { 
  unique: true, 
  partialFilterExpression: { sessionId: { $type: "string" } } 
});

