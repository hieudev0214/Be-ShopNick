import { Module } from '@nestjs/common';

import { CategoryGroupsController } from './category-groups.controller';
import { CategoryGroupsService } from './category-groups.service';
import { CloudinaryModule } from 'src/modules/cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [CategoryGroupsController],
  providers: [CategoryGroupsService],
})
export class CategoryGroupsModule {}
