import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { UserEntity } from './entities/user.entity';
import { GetUserDto } from './dto/get-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo user mới
  async create(dto: CreateUserDto) {
    if (!dto.email && !dto.phone) {
      throw new Error('Email or phone is required');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        passwordHash,
        fullName: dto.fullName,
        username: dto.username,
        avatarUrl: dto.avatarUrl,
        zaloPhone: dto.zaloPhone,
        zaloName: dto.zaloName,
      },
    });

    return new UserEntity(user);
  }

  async findAll(query: GetUserDto) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);

    const users = await this.prisma.user.findMany({
      where: {
        role: query.role,
        status: query.status,
        OR: query.keyword
          ? [
              {
                email: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
              {
                phone: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
              {
                fullName: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
              {
                username: {
                  contains: query.keyword,
                  mode: 'insensitive',
                },
              },
            ]
          : undefined,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => new UserEntity(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return new UserEntity(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const existedUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existedUser) {
      throw new Error('User not found');
    }

    const dataUser: any = {
      email: dto.email,
      phone: dto.phone,
      fullName: dto.fullName,
      username: dto.username,
      avatarUrl: dto.avatarUrl,
      zaloPhone: dto.zaloPhone,
      zaloName: dto.zaloName,
    };

    if (dto.password) {
      dataUser.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: dataUser,
    });

    return new UserEntity(user);
  }
}
