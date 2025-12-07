import { IsString, IsInt, IsNumber, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsNumber()
  @Min(0)
  price: number;
}
