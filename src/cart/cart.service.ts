import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cart, CartDocument, CartItem } from './schemas/cart.schema';
import { AddItemToCartDto, UpdateCartItemDto, CartResponseDto, CartSummaryDto, CartItemResponseDto } from './dto';
import { SyncCartDto } from './dto/sync-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
  ) {}

  async getCart(userId: string): Promise<CartResponseDto> {
    let cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      cart = await this.createEmptyCart(userId) as any;
    }

    return this.mapToCartResponse(cart!);
  }

  async addItem(userId: string, addItemDto: AddItemToCartDto): Promise<CartResponseDto> {
    let cart = await this.cartModel.findOne({ userId }).exec();

    if (!cart) {
      cart = await this.createEmptyCart(userId) as any;
    }

    // Type assertion to ensure cart is not null after creation
    const cartDoc = cart!;

    // Verificar si hay productos de diferentes tiendas
    if (cartDoc.items.length > 0 && cartDoc.primaryStoreId && cartDoc.primaryStoreId !== addItemDto.storeId) {
      throw new BadRequestException(
        `No puedes agregar productos de diferentes tiendas. Tu carrito actual contiene productos de ${cartDoc.primaryStoreName}. Para agregar productos de ${addItemDto.storeName}, primero debes vaciar tu carrito.`
      );
    }

    // Buscar si el producto ya existe en el carrito
    const existingItemIndex = cartDoc.items.findIndex(item => item.productId === addItemDto.productId);

    if (existingItemIndex >= 0) {
      // Si existe, actualizar la cantidad
      cartDoc.items[existingItemIndex].quantity += addItemDto.quantity;
    } else {
      // Si no existe, agregarlo
      const newItem: CartItem = {
        productId: addItemDto.productId,
        name: addItemDto.name,
        price: addItemDto.price,
        quantity: addItemDto.quantity,
        storeId: addItemDto.storeId,
        storeName: addItemDto.storeName,
        imageUrl: addItemDto.imageUrl,
      };
      cartDoc.items.push(newItem);
    }

    // Actualizar información de la tienda principal si es el primer producto
    if (!cartDoc.primaryStoreId) {
      cartDoc.primaryStoreId = addItemDto.storeId;
      cartDoc.primaryStoreName = addItemDto.storeName;
    }

    // Recalcular totales y actualizar última actividad
    this.recalculateTotals(cartDoc);
    cartDoc.lastActivity = new Date();

    await cartDoc.save();
    return this.mapToCartResponse(cartDoc);
  }

  async updateItem(userId: string, productId: string, updateItemDto: UpdateCartItemDto): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    cart.items[itemIndex].quantity = updateItemDto.quantity;
    
    // Recalcular totales y actualizar última actividad
    this.recalculateTotals(cart);
    cart.lastActivity = new Date();

    await cart.save();
    return this.mapToCartResponse(cart);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new NotFoundException('Producto no encontrado en el carrito');
    }

    cart.items.splice(itemIndex, 1);

    // Si no quedan items, limpiar información de tienda principal
    if (cart.items.length === 0) {
      cart.primaryStoreId = undefined;
      cart.primaryStoreName = undefined;
    }

    // Recalcular totales y actualizar última actividad
    this.recalculateTotals(cart);
    cart.lastActivity = new Date();

    await cart.save();
    return this.mapToCartResponse(cart);
  }

  async clearCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      throw new NotFoundException('Carrito no encontrado');
    }

    cart.items = [];
    cart.primaryStoreId = undefined;
    cart.primaryStoreName = undefined;
    cart.totalItems = 0;
    cart.totalPrice = 0;
    cart.lastActivity = new Date();

    await cart.save();
    return this.mapToCartResponse(cart);
  }

  async getCartSummary(userId: string): Promise<CartSummaryDto> {
    const cart = await this.cartModel.findOne({ userId }).exec();
    
    if (!cart) {
      return {
        totalItems: 0,
        totalPrice: 0,
        uniqueProducts: 0,
        isEmpty: true,
      };
    }

    return {
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      uniqueProducts: cart.items.length,
      isEmpty: cart.items.length === 0,
    };
  }

  private async createEmptyCart(userId: string): Promise<CartDocument> {
    const cart = new this.cartModel({
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
      lastActivity: new Date(),
    });

    return await cart.save() as CartDocument;
  }

  private recalculateTotals(cart: CartDocument): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalPrice = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  private mapToCartResponse(cart: CartDocument): CartResponseDto {
    const items: CartItemResponseDto[] = cart.items.map(item => ({
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      storeId: item.storeId,
      storeName: item.storeName,
      imageUrl: item.imageUrl,
      subtotal: item.price * item.quantity,
    }));

    // Calcular tiendas únicas
    const storeMap = new Map<string, { storeName: string; itemCount: number }>();
    cart.items.forEach(item => {
      if (storeMap.has(item.storeId)) {
        storeMap.get(item.storeId)!.itemCount++;
      } else {
        storeMap.set(item.storeId, { storeName: item.storeName, itemCount: 1 });
      }
    });

    const stores = Array.from(storeMap.entries()).map(([storeId, data]) => ({
      storeId,
      storeName: data.storeName,
      itemCount: data.itemCount,
    }));

    return {
      id: (cart._id as any).toString(),
      userId: cart.userId,
      items,
      primaryStoreId: cart.primaryStoreId,
      primaryStoreName: cart.primaryStoreName,
      totalItems: cart.totalItems,
      totalPrice: cart.totalPrice,
      hasMixedStores: stores.length > 1,
      stores,
      lastActivity: cart.lastActivity,
      createdAt: cart.createdAt!,
      updatedAt: cart.updatedAt!,
    };
  }

  async syncCart(userId: string, syncCartDto: SyncCartDto): Promise<CartResponseDto> {
    try {
      // Eliminar carrito existente
      await this.cartModel.findOneAndDelete({ userId }).exec();
      
      // Crear nuevo carrito con los items sincronizados
      const cart = new this.cartModel({
        userId,
        items: syncCartDto.items,
        primaryStoreId: syncCartDto.primaryStoreId,
        primaryStoreName: syncCartDto.primaryStoreName,
        lastActivity: new Date(),
      });
      
      // Recalcular totales
      this.recalculateTotals(cart);
      
      const savedCart = await cart.save();
      return this.mapToCartResponse(savedCart);
    } catch (error) {
      console.error('Error en syncCart:', error);
      throw error;
    }
  }
}


