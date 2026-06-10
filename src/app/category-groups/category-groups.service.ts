import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { CreateCategoryGroupDto } from './dto/create-category-group.dto';
import { UpdateCategoryGroupDto } from './dto/update-category-group.dto';

import { CategoryGroupStatus, GameStatus } from '@prisma/client';

@Injectable()
export class CategoryGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryGroupDto, userId: string) {
    const existed = await this.prisma.categoryGroup.findFirst({
      where: {
        gameID: dto.gameID,
        OR: [{ name: dto.name }, { slug: dto.slug }],
      },
    });

    if (existed) {
      throw new BadRequestException('Tên hoặc slug đã tồn tại');
    }

    return this.prisma.categoryGroup.create({
      data: {
        gameID: dto.gameID,

        createdById: userId,

        name: dto.name,
        slug: dto.slug,

        thumbnailUrl: dto.thumbnailUrl,
        priority: dto.priority || 0,

        description: dto.description,
        content: dto.content,

        status: dto.status ?? CategoryGroupStatus.active,
      },
    });
  }

  async update(id: string, dto: UpdateCategoryGroupDto) {
    const category = await this.prisma.categoryGroup.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category group not found');
    }

    return this.prisma.categoryGroup.update({
      where: { id },
      data: {
        name: dto.name,
        slug: dto.slug,
        thumbnailUrl: dto.thumbnailUrl,
        priority: dto.priority,
        description: dto.description,
        content: dto.content,
        status: dto.status,
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.categoryGroup.findUnique({
      where: {
        id,
      },

      include: {
        game: true,
        createdBy: true,
      },
    });
  }

  async delete(id: string) {
    const category = await this.prisma.categoryGroup.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category group not found');
    }

    return this.prisma.categoryGroup.delete({
      where: {
        id,
      },
    });
  }

  async adminList(gameID?: string) {
    return this.prisma.categoryGroup.findMany({
      where: gameID
        ? {
            gameID,
          }
        : undefined,

      include: {
        game: true,

        createdBy: true, // thêm dòng này

        _count: {
          select: {
            accounts: true,
          },
        },
      },

      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async publicList(gameSlug: string) {
    return this.prisma.categoryGroup.findMany({
      where: {
        status: CategoryGroupStatus.active,

        game: {
          slug: gameSlug,
          status: 'active',
        },
      },

      include: {
        _count: {
          select: {
            accounts: true,
          },
        },
      },

      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async publicByGame(slug: string) {
    return this.prisma.categoryGroup.findMany({
      where: {
        status: CategoryGroupStatus.active,

        game: {
          slug,
          status: GameStatus.active,
        },
      },

      include: {
        game: true,

        _count: {
          select: {
            accounts: true,
          },
        },
      },

      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }
}
