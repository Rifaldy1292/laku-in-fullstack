import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FinancialRecordService } from './financial-record.service';
import { CreateFinancialRecordDto } from './dto/create-financial-record.dto';
import { UpdateFinancialRecordDto } from './dto/update-financial-record.dto';

@Controller('financial-record')
export class FinancialRecordController {
  constructor(
    private readonly financialRecordService: FinancialRecordService,
  ) {}

  @Post()
  create(@Body() createFinancialRecordDto: CreateFinancialRecordDto) {
    return this.financialRecordService.create(createFinancialRecordDto);
  }

  @Get()
  findAll() {
    return this.financialRecordService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.financialRecordService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateFinancialRecordDto: UpdateFinancialRecordDto,
  ) {
    return this.financialRecordService.update(+id, updateFinancialRecordDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.financialRecordService.remove(+id);
  }
}
