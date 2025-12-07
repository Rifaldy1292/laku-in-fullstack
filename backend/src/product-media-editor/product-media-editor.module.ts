import { Module } from '@nestjs/common';
import { ProductMediaEditorService } from './product-media-editor.service';
import { ProductMediaEditorController } from './product-media-editor.controller';

@Module({
  controllers: [ProductMediaEditorController],
  providers: [ProductMediaEditorService],
})
export class ProductMediaEditorModule {}
