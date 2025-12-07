import { Test, TestingModule } from '@nestjs/testing';
import { ProductMediaEditorController } from './product-media-editor.controller';
import { ProductMediaEditorService } from './product-media-editor.service';

describe('ProductMediaEditorController', () => {
  let controller: ProductMediaEditorController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductMediaEditorController],
      providers: [ProductMediaEditorService],
    }).compile();

    controller = module.get<ProductMediaEditorController>(
      ProductMediaEditorController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
