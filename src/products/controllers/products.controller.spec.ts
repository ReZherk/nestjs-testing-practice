import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from '../services/products.service';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductCategory } from '../entities/product.entity';

describe('ProductsController', () => {
  let controller: ProductsController;
  let mockProductsService: Partial<ProductsService>;

  beforeEach(async () => {
    mockProductsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByCategory: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getTotalValue: jest.fn(),
      getAvailableProducts: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        { provide: ProductsService, useValue: mockProductsService },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 5,
      };

      const mockProduct = {
        id: '1',
        ...createDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProductsService.create = jest.fn().mockReturnValue(mockProduct);

      const result = await controller.create(createDto);

      expect(mockProductsService.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1', price: 10, category: ProductCategory.BOOKS, inStock: true },
        { id: '2', name: 'Product 2', price: 20, category: ProductCategory.ELECTRONICS, inStock: false },
      ];

      mockProductsService.findAll = jest.fn().mockReturnValue(mockProducts);

      const result = await controller.findAll();

      expect(mockProductsService.findAll).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const mockProduct = { id: '1', name: 'Test', price: 100, category: ProductCategory.CLOTHING, inStock: true };
      mockProductsService.findOne = jest.fn().mockReturnValue(mockProduct);

      const result = await controller.findOne('1');

      expect(mockProductsService.findOne).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockProduct);
    });
  });

  describe('findByCategory', () => {
    it('should return products by category', async () => {
      const mockProducts = [
        { id: '1', name: 'Electronic', price: 100, category: ProductCategory.ELECTRONICS, inStock: true },
      ];
      mockProductsService.findByCategory = jest.fn().mockReturnValue(mockProducts);

      const result = await controller.findByCategory(ProductCategory.ELECTRONICS);

      expect(mockProductsService.findByCategory).toHaveBeenCalledWith(ProductCategory.ELECTRONICS);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateDto: UpdateProductDto = { name: 'Updated Name' };
      const mockProduct = { id: '1', name: 'Updated Name', price: 100, category: ProductCategory.BOOKS, inStock: true };

      mockProductsService.update = jest.fn().mockReturnValue(mockProduct);

      const result = await controller.update('1', updateDto);

      expect(mockProductsService.update).toHaveBeenCalledWith('1', updateDto);
      expect(result).toEqual(mockProduct);
    });
  });

  describe('remove', () => {
    it('should remove a product and return true', async () => {
      mockProductsService.remove = jest.fn().mockReturnValue(true);

      const result = await controller.remove('1');

      expect(mockProductsService.remove).toHaveBeenCalledWith('1');
      expect(result).toBe(true);
    });

    it('should return false when product not found', async () => {
      mockProductsService.remove = jest.fn().mockReturnValue(false);

      const result = await controller.remove('999');

      expect(mockProductsService.remove).toHaveBeenCalledWith('999');
      expect(result).toBe(false);
    });
  });

  describe('getTotalValue', () => {
    it('should return total value', async () => {
      mockProductsService.getTotalValue = jest.fn().mockReturnValue(1500);

      const result = await controller.getTotalValue();

      expect(mockProductsService.getTotalValue).toHaveBeenCalled();
      expect(result).toEqual({ totalValue: 1500 });
    });
  });

  describe('getAvailableProducts', () => {
    it('should return available products', async () => {
      const mockProducts = [{ id: '1', name: 'Avail', price: 100, category: ProductCategory.CLOTHING, inStock: true }];
      mockProductsService.getAvailableProducts = jest.fn().mockReturnValue(mockProducts);

      const result = await controller.getAvailableProducts();

      expect(mockProductsService.getAvailableProducts).toHaveBeenCalled();
      expect(result).toEqual(mockProducts);
    });
  });
});
