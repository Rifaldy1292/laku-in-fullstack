import { PartialType } from '@nestjs/mapped-types';
import { CreateProductMediaEditorDto } from './create-product-media-editor.dto';

export class UpdateProductMediaEditorDto extends PartialType(
  CreateProductMediaEditorDto,
) {}
