import { Injectable, NotFoundException } from '@nestjs/common';

import slugify from 'slugify';

import { PrismaService } from 'src/common/prisma/prisma.service';

import { CreateGameAccountDto } from './dto/create-game-account.dto';

import { UpdateGameAccountDto } from './dto/update-game-account.dto';
import { CloudinaryService } from 'src/modules/cloudinary/cloudinary.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class GameAccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // CREATE
  async create(
    dto: CreateGameAccountDto,
    files: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const thumbnailFile = files?.thumbnail?.[0];

    let thumbnailUrl: string | null = null;

    if (thumbnailFile) {
      const thumbnailUpload =
        await this.cloudinaryService.uploadImage(thumbnailFile);

      thumbnailUrl = thumbnailUpload.secure_url;
    }
    // IMAGES
    const imageFiles = files?.images || [];

    const uploadedImages = await Promise.all(
      imageFiles.map(async (file) => {
        const result = await this.cloudinaryService.uploadImage(file);

        return {
          imageUrl: result.secure_url,
          publicId: result.public_id,
        };
      }),
    );
    // SLUG
    const slug =
      dto.slug ||
      slugify(dto.productName, {
        lower: true,
        strict: true,
      });
    // CREATE

    return this.prisma.gameAccount.create({
      data: {
        // relations
        gameID: dto.gameID,

        groupID: dto.groupID,

        // product
        productName: dto.productName,

        categoryGroup: dto.categoryGroup,

        productCode: dto.productCode,

        slug,

        thumbnailUrl,

        description: dto.description,

        detailInfo: dto.detailInfo,

        accountInfo: dto.accountInfo,

        productType: dto.productType || 'Mặc định',

        // price
        price: Number(dto.price),

        salePrice: dto.salePrice !== undefined ? Number(dto.salePrice) : null,

        discountPercent: dto.discountPercent || 0,

        currency: 'VND',

        // status
        status: dto.status || 'available',

        postedByType: dto.postedByType || 'admin',

        approvalStatus: dto.approvalStatus || 'approved',

        // images
        images: {
          create: uploadedImages.map((img, index) => ({
            imageUrl: img.imageUrl,

            publicId: img.publicId,

            isPrimary: index === 0,

            sortOrder: index,
          })),
        },
      },

      include: {
        images: true,

        group: true,

        game: true,
      },
    });
  }

  // GET ALL + PAGINATION
  async findAll(page = 1, limit = 10, groupId?: string) {
    const skip = (page - 1) * limit;

    const where = groupId
      ? {
          groupID: groupId,
        }
      : {};

    const [products, total] = await Promise.all([
      this.prisma.gameAccount.findMany({
        where,

        include: {
          images: true,
          group: true,
          game: true,
        },

        orderBy: {
          createdAt: 'desc',
        },

        skip,
        take: limit,
      }),

      this.prisma.gameAccount.count({
        where,
      }),
    ]);

    return {
      data: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findBySlug(
    slug: string,
    page = 1,
    limit = 10,
    minPrice?: number,
    maxPrice?: number,
    sortBy?: string,
    order?: 'asc' | 'desc',
  ) {
    const where: Prisma.GameAccountWhereInput = {
      group: {
        slug,
      },
    };

    // FILTER GIÁ
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};

      if (minPrice !== undefined) {
        where.price.gte = minPrice;
      }

      if (maxPrice !== undefined) {
        where.price.lte = maxPrice;
      }
    }

    // SORT
    const orderBy: Prisma.GameAccountOrderByWithRelationInput =
      sortBy && order
        ? {
            [sortBy]: order,
          }
        : {
            createdAt: 'desc',
          };

    const [data, total] = await Promise.all([
      this.prisma.gameAccount.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,

        include: {
          group: true,
          game: true,
        },
      }),

      this.prisma.gameAccount.count({
        where,
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByProductCode(productCode: string) {
    return this.prisma.gameAccount.findMany({
      where: {
        productCode,
      },
      include: {
        game: true,
        group: true,
      },
    });
  }

  // GET ONE
  async findOne(id: string) {
    console.log('ID:', id);

    const account = await this.prisma.gameAccount.findUnique({
      where: {
        id,
      },

      include: {
        images: true,

        group: true,

        game: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    return account;
  }

  // UPDATE
  async update(
    id: string,
    dto: UpdateGameAccountDto,
    files?: {
      thumbnail?: Express.Multer.File[];
      images?: Express.Multer.File[];
    },
  ) {
    const account = await this.prisma.gameAccount.findUnique({
      where: {
        id,
      },

      include: {
        images: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // =========================
    // THUMBNAIL
    // =========================

    let thumbnailData = {};

    const thumbnailFile = files?.thumbnail?.[0];

    if (thumbnailFile) {
      const thumbnailUpload =
        await this.cloudinaryService.uploadImage(thumbnailFile);

      thumbnailData = {
        thumbnailUrl: thumbnailUpload.secure_url,
      };
    }

    // =========================
    // SLUG
    // =========================

    let slugData = {};

    if (dto.productName) {
      slugData = {
        slug: slugify(dto.productName, {
          lower: true,
          strict: true,
        }),
      };
    }

    // =========================
    // IMAGES
    // =========================

    let imageCreate = {};

    if (files?.images && files.images.length > 0) {
      // xóa ảnh cũ
      await this.prisma.gameAccountImage.deleteMany({
        where: {
          accountID: id,
        },
      });

      // upload cloudinary
      const uploadedImages = await Promise.all(
        files.images.map(async (file) => {
          const result = await this.cloudinaryService.uploadImage(file);

          return {
            imageUrl: result.secure_url,
            publicId: result.public_id,
          };
        }),
      );

      imageCreate = {
        images: {
          create: uploadedImages.map((img, index) => ({
            imageUrl: img.imageUrl,

            publicId: img.publicId,

            isPrimary: index === 0,

            sortOrder: index,
          })),
        },
      };
    }

    // =========================
    // UPDATE
    // =========================

    return this.prisma.gameAccount.update({
      where: {
        id,
      },

      data: {
        ...dto,

        ...slugData,

        ...thumbnailData,

        ...imageCreate,

        price: dto.price !== undefined ? Number(dto.price) : undefined,

        salePrice:
          dto.salePrice !== undefined ? Number(dto.salePrice) : undefined,
      },

      include: {
        images: true,

        group: true,

        game: true,
      },
    });
  }

  // DELETE
  async remove(id: string) {
    const account = await this.prisma.gameAccount.findUnique({
      where: {
        id,
      },

      include: {
        images: true,
      },
    });

    if (!account) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // =========================
    // DELETE CLOUDINARY IMAGES
    // =========================

    for (const image of account.images) {
      if (image.publicId) {
        await this.cloudinaryService.deleteImage(image.publicId);
      }
    }

    // =========================
    // DELETE DB IMAGES
    // =========================

    await this.prisma.gameAccountImage.deleteMany({
      where: {
        accountID: id,
      },
    });

    // =========================
    // DELETE PRODUCT
    // =========================

    return this.prisma.gameAccount.delete({
      where: {
        id,
      },
    });
  }
}
