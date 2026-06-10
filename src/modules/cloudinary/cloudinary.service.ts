import { Injectable, InternalServerErrorException } from '@nestjs/common';

import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    console.log('CLOUDINARY CONFIG', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret_exists: !!process.env.CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder = 'game-accounts',
  ): Promise<UploadApiResponse> {
    if (!file) {
      throw new InternalServerErrorException('File is required');
    }

    console.log('UPLOAD FILE', {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      hasBuffer: !!file.buffer,
    });

    return new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            console.log('CLOUDINARY REAL ERROR:', error);

            return reject(new InternalServerErrorException(error.message));
          }

          if (!result) {
            return reject(
              new InternalServerErrorException('Cloudinary result empty'),
            );
          }

          resolve(result);
        },
      );

      stream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });
  }
}
