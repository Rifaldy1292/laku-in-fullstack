import { Injectable } from '@nestjs/common';
import { CreateFinancialRecordDto } from './dto/create-financial-record.dto';
import { UpdateFinancialRecordDto } from './dto/update-financial-record.dto';

@Injectable()
export class FinancialRecordService {
  create(createFinancialRecordDto: CreateFinancialRecordDto) {
    return 'This action adds a new financialRecord';
  }

  findAll() {
    return `This action returns all financialRecord`;
  }

  findOne(id: number) {
    return `This action returns a #${id} financialRecord`;
  }

  update(id: number, updateFinancialRecordDto: UpdateFinancialRecordDto) {
    return `This action updates a #${id} financialRecord`;
  }

  remove(id: number) {
    return `This action removes a #${id} financialRecord`;
  }
}
