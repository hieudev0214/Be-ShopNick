import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateGameDto, userId: string) {
    const existed = await this.prisma.game.findFirst({
      where: {
        OR: [{ name: dto.name }, { slug: dto.slug }],
      },
    });

    if (existed) {
      throw new BadRequestException('Game name or slug already exists');
    }

    return this.prisma.game.create({
      data: {
        createdById: userId,

        name: dto.name,
        slug: dto.slug,
        thumbnailUrl: dto.thumbnailUrl,
        description: dto.description,

        priority: dto.priority ?? 0,

        status: dto.status ?? 'active',
      },
    });
  }

  async update(id: string, dto: UpdateGameDto) {
    const game = await this.prisma.game.findUnique({ where: { id } });
    if (!game) throw new NotFoundException('Game not found');

    if (dto.name || dto.slug) {
      const existed = await this.prisma.game.findFirst({
        where: {
          id: { not: id },
          OR: [
            dto.name ? { name: dto.name } : undefined,
            dto.slug ? { slug: dto.slug } : undefined,
          ].filter(Boolean) as any,
        },
      });

      if (existed) {
        throw new BadRequestException('Game name or slug already exists');
      }
    }

    return this.prisma.game.update({
      where: { id },
      data: dto,
    });
  }

  async adminList() {
    return this.prisma.game.findMany({
      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],

      include: {
        createdBy: true,

        _count: {
          select: {
            groups: true,
            accounts: true,
          },
        },
      },
    });
  }

  async adminDetail(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    if (!game) throw new NotFoundException('Game not found');
    return game;
  }

  async publicList() {
    return this.prisma.game.findMany({
      where: {
        status: 'active',
      },

      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],

      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        description: true,
        priority: true,
      },
    });
  }
  async publicDetail(slug: string) {
    const game = await this.prisma.game.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnailUrl: true,
        description: true,
        status: true,
      },
    });

    if (!game || game.status !== 'active') {
      throw new NotFoundException('Game not found');
    }

    return game;
  }

  async delete(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
    });

    if (!game) {
      throw new NotFoundException('Game not found');
    }

    return this.prisma.game.delete({
      where: { id },
    });
  }
}
