import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Product, ProductCategory } from '../entities/product.entity';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';

@Injectable()
export class ProductsService {
  private products: Product[] = [];
  private idCounter = 1;

  create(createProductDto: CreateProductDto): Product {
    if (createProductDto.price <= 0) {
      throw new BadRequestException('Price must be greater than zero');
    }

    const product: Product = {
      id: (this.idCounter++).toString(),
      ...createProductDto,
      stockQuantity: createProductDto.stockQuantity ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.products.push(product);
    return product;
  }

  findAll(): Product[] {
    return this.products;
  }

  findOne(id: string): Product {
    const product = this.products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    return product;
  }

  findByCategory(category: ProductCategory): Product[] {
    return this.products.filter(p => p.category === category);
  }

  update(id: string, updateProductDto: UpdateProductDto): Product {
    const productIndex = this.products.findIndex(p => p.id === id);
    if (productIndex === -1) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }

    this.products[productIndex] = {
      ...this.products[productIndex],
      ...updateProductDto,
      updatedAt: new Date(),
    };

    return this.products[productIndex];
  }

  remove(id: string): boolean {
    const initialLength = this.products.length;
    this.products = this.products.filter(p => p.id !== id);
    return this.products.length < initialLength;
  }

  getTotalValue(): number {
    return this.products.reduce((total, product) => {
      return total + (product.price * (product.stockQuantity || 0));
    }, 0);
  }

  getAvailableProducts(): Product[] {
    return this.products.filter(p => p.inStock && (p.stockQuantity || 0) > 0);
  }
}
