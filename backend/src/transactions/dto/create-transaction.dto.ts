import { IsString, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsString()
  item_name: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;

  @IsDate()
  @Type(() => Date)
  sale_date: Date;
}
