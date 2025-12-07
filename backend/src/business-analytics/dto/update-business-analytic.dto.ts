import { PartialType } from '@nestjs/mapped-types';
import { CreateBusinessAnalyticDto } from './create-business-analytic.dto';

export class UpdateBusinessAnalyticDto extends PartialType(
  CreateBusinessAnalyticDto,
) {}
