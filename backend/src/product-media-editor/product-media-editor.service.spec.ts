import { Test, TestingModule } from '@nestjs/testing';
import { ProductMediaEditorService } from './product-media-editor.service';

describe('ProductMediaEditorService', () => {
  let service: ProductMediaEditorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductMediaEditorService],
    }).compile();

    service = module.get<ProductMediaEditorService>(ProductMediaEditorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
