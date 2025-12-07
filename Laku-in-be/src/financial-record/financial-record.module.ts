import { Module } from '@nestjs/common';
import { FinancialRecordService } from './financial-record.service';
import { FinancialRecordController } from './financial-record.controller';

@Module({
  controllers: [FinancialRecordController],
  providers: [FinancialRecordService],
})
export class FinancialRecordModule {}
