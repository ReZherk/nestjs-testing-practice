import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductCategory } from '../entities/product.entity';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsService],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', () => {
      const createDto: CreateProductDto = {
        name: 'Test Product',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 10,
      };

      const result = service.create(createDto);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createDto.name);
      expect(result.price).toBe(createDto.price);
      expect(result.category).toBe(createDto.category);
      expect(result.inStock).toBe(createDto.inStock);
      expect(result.stockQuantity).toBe(createDto.stockQuantity);
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('should throw BadRequestException when price is zero', () => {
      const createDto: CreateProductDto = {
        name: 'Invalid Product',
        price: 0,
        category: ProductCategory.BOOKS,
        inStock: true,
        stockQuantity: 5,
      };

      expect(() => service.create(createDto)).toThrow(
        'Price must be greater than zero',
      );
    });

    it('should set stockQuantity to 0 if not provided', () => {
      const createDto: CreateProductDto = {
        name: 'Product without stock',
        price: 50,
        category: ProductCategory.CLOTHING,
        inStock: false,
      };

      const result = service.create(createDto);

      expect(result.stockQuantity).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return all products', () => {
      service.create({
        name: 'Product 1',
        price: 10,
        category: ProductCategory.HOME,
        inStock: true,
      });
      service.create({
        name: 'Product 2',
        price: 20,
        category: ProductCategory.BOOKS,
        inStock: true,
      });

      const result = service.findAll();

      expect(result).toHaveLength(2);
    });

    it('should return empty array when no products', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', () => {
      const created = service.create({
        name: 'Find Me',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
      });

      const result = service.findOne(created.id);

      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when product not found', () => {
      expect(() => service.findOne('999')).toThrow(
        'Product with id 999 not found',
      );
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', () => {
      service.create({
        name: 'Electronic 1',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
      });
      service.create({
        name: 'Book 1',
        price: 20,
        category: ProductCategory.BOOKS,
        inStock: true,
      });
      service.create({
        name: 'Electronic 2',
        price: 200,
        category: ProductCategory.ELECTRONICS,
        inStock: false,
      });

      const result = service.findByCategory(ProductCategory.ELECTRONICS);

      expect(result).toHaveLength(2);
      expect(result.every(p => p.category === ProductCategory.ELECTRONICS)).toBe(true);
    });

    it('should return empty array when no products in category', () => {
      service.create({
        name: 'Book',
        price: 20,
        category: ProductCategory.BOOKS,
        inStock: true,
      });

      const result = service.findByCategory(ProductCategory.CLOTHING);
      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update a product successfully', () => {
      const created = service.create({
        name: 'Old Name',
        price: 50,
        category: ProductCategory.CLOTHING,
        inStock: true,
      });

      const updateDto: UpdateProductDto = {
        name: 'New Name',
        price: 75,
      };

      const result = service.update(created.id, updateDto);

      expect(result.name).toBe('New Name');
      expect(result.price).toBe(75);
      expect(result.id).toBe(created.id);
    });

    it('should throw NotFoundException when updating non-existent product', () => {
      const updateDto: UpdateProductDto = { name: 'New Name' };
      expect(() => service.update('999', updateDto)).toThrow(
        'Product with id 999 not found',
      );
    });

    it('should update only provided fields', () => {
      const created = service.create({
        name: 'Product',
        price: 100,
        category: ProductCategory.HOME,
        inStock: true,
        stockQuantity: 10,
      });

      const updateDto: UpdateProductDto = { price: 150 };
      const result = service.update(created.id, updateDto);

      expect(result.price).toBe(150);
      expect(result.name).toBe('Product');
      expect(result.category).toBe(ProductCategory.HOME);
    });
  });

  describe('remove', () => {
    it('should remove a product successfully', () => {
      const created = service.create({
        name: 'To Delete',
        price: 100,
        category: ProductCategory.BOOKS,
        inStock: true,
      });

      const result = service.remove(created.id);

      expect(result).toBe(true);
      expect(() => service.findOne(created.id)).toThrow();
    });

    it('should return false when product not found', () => {
      const result = service.remove('999');
      expect(result).toBe(false);
    });
  });

  describe('getTotalValue', () => {
    it('should calculate total inventory value correctly', () => {
      service.create({
        name: 'Product 1',
        price: 10,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 5,
      });
      service.create({
        name: 'Product 2',
        price: 20,
        category: ProductCategory.BOOKS,
        inStock: true,
        stockQuantity: 3,
      });

      const result = service.getTotalValue();

      expect(result).toBe(110); // (10 * 5) + (20 * 3) = 50 + 60
    });

    it('should return 0 when no products', () => {
      const result = service.getTotalValue();
      expect(result).toBe(0);
    });

    it('should handle products with no stockQuantity', () => {
      service.create({
        name: 'No Stock',
        price: 100,
        category: ProductCategory.CLOTHING,
        inStock: false,
      });

      const result = service.getTotalValue();
      expect(result).toBe(0);
    });
  });

  describe('getAvailableProducts', () => {
    it('should return only in-stock products with positive quantity', () => {
      service.create({
        name: 'Available 1',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 10,
      });
      service.create({
        name: 'Out of Stock',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: false,
        stockQuantity: 0,
      });
      service.create({
        name: 'Zero Quantity',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 0,
      });

      const result = service.getAvailableProducts();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Available 1');
    });

    it('should return empty array when no available products', () => {
      service.create({
        name: 'Unavailable',
        price: 100,
        category: ProductCategory.BOOKS,
        inStock: false,
        stockQuantity: 0,
      });

      const result = service.getAvailableProducts();
      expect(result).toEqual([]);
    });
  });
});
