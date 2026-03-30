import { IsString, IsNumber, IsBoolean, IsEnum, IsOptional, Min, MaxLength, IsNotEmpty } from 'class-validator';
import { ProductCategory } from '../entities/product.entity';

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0.01)
  price: number;

  @IsEnum(ProductCategory)
  category: ProductCategory;

  @IsBoolean()
  inStock: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;
}
