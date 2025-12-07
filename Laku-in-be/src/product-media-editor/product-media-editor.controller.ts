import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductMediaEditorService } from './product-media-editor.service';

@Controller('product-media-editor')
export class ProductMediaEditorController {
  constructor(
    private readonly productMediaEditorService: ProductMediaEditorService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File harus diunggah');
    }
    // Panggil service untuk mengedit menjadi poster estetik
    return this.productMediaEditorService.editImageToPoster(file);
  }
}
