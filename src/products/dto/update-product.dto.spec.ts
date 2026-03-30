import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProductDto } from './update-product.dto';

describe('UpdateProductDto', () => {
  describe('validation', () => {
    it('should validate an empty DTO (all optional)', async () => {
      const dto = plainToInstance(UpdateProductDto, {});

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept valid price update', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 150,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should reject negative price', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: -50,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject zero price', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 0,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept positive price', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        price: 0.01,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept partial updates with multiple fields', async () => {
      const dto = plainToInstance(UpdateProductDto, {
        name: 'Updated Name',
        price: 200,
        inStock: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});

