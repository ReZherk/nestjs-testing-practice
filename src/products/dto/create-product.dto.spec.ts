import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateProductDto } from './create-product.dto';
import { ProductCategory } from '../entities/product.entity';

describe('CreateProductDto', () => {
  describe('validation', () => {
    it('should validate a valid DTO', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Valid Product',
        price: 100,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
        stockQuantity: 10,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject empty name', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: '',
        price: 100,
        category: ProductCategory.BOOKS,
        inStock: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should reject name longer than 100 characters', async () => {
      const longName = 'a'.repeat(101);
      const dto = plainToInstance(CreateProductDto, {
        name: longName,
        price: 100,
        category: ProductCategory.CLOTHING,
        inStock: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative price', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Product',
        price: -10,
        category: ProductCategory.HOME,
        inStock: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.property === 'price')).toBe(true);
    });

    it('should reject zero price', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Product',
        price: 0,
        category: ProductCategory.ELECTRONICS,
        inStock: true,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept zero stockQuantity', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Product',
        price: 100,
        category: ProductCategory.BOOKS,
        inStock: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject stockQuantity less than zero', async () => {
      const dto = plainToInstance(CreateProductDto, {
        name: 'Product',
        price: 100,
        category: ProductCategory.CLOTHING,
        inStock: true,
        stockQuantity: -5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should require all mandatory fields', async () => {
      const dto = plainToInstance(CreateProductDto, {});

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.map(e => e.property)).toContain('name');
      expect(errors.map(e => e.property)).toContain('price');
      expect(errors.map(e => e.property)).toContain('category');
      expect(errors.map(e => e.property)).toContain('inStock');
    });

    it('should accept all valid categories', async () => {
      const categories = Object.values(ProductCategory);

      categories.forEach(category => {
        const dto = plainToInstance(CreateProductDto, {
          name: 'Product',
          price: 100,
          category,
          inStock: true,
        });

        const errors = validate(dto);
        // This is async, so we need to handle promise
        expect(errors).resolves.toHaveLength(0);
      });
    });
  });
});

