import { Test, TestingModule } from '@nestjs/testing';
import { CategoryGroupsController } from './category-groups.controller';

describe('CategoryGroupsController', () => {
  let controller: CategoryGroupsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryGroupsController],
    }).compile();

    controller = module.get<CategoryGroupsController>(CategoryGroupsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
