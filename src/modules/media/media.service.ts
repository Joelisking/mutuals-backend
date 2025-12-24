import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v2 as cloudinary } from 'cloudinary';
import prisma from '../../common/config/database.config';
import { env } from '../../common/config/env.config';
import { AppError } from '../../common/middleware/error.middleware';
import { MediaType } from '../../common/types';
import path from 'path';
import { randomUUID } from 'crypto';

// Configure Cloudinary
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

// Configure AWS S3
let s3Client: S3Client | null = null;
if (env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY) {
  s3Client = new S3Client({
    region: env.AWS_REGION,
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

interface UploadResult {
  url: string;
  publicId?: string;
  key?: string;
}

export class MediaService {
  /**
   * Upload file to cloud storage (Cloudinary or S3)
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
    useCloudinary: boolean = true
  ): Promise<UploadResult> {
    // Validate file size
    if (file.size > env.MAX_FILE_SIZE) {
      throw new AppError(
        `File size exceeds maximum allowed size of ${env.MAX_FILE_SIZE / 1024 / 1024}MB`,
        400
      );
    }

    // Validate file type
    const allowedTypes = env.ALLOWED_FILE_TYPES.split(',');
    if (!allowedTypes.includes(file.mimetype)) {
      throw new AppError(
        `File type ${file.mimetype} is not allowed. Allowed types: ${env.ALLOWED_FILE_TYPES}`,
        400
      );
    }

    if (useCloudinary && env.CLOUDINARY_CLOUD_NAME) {
      return await this.uploadToCloudinary(file, folder);
    } else if (s3Client) {
      return await this.uploadToS3(file, folder);
    } else {
      throw new AppError('No cloud storage service configured', 500);
    }
  }

  /**
   * Upload to Cloudinary
   */
  private async uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder,
              resource_type: 'auto',
              transformation: file.mimetype.startsWith('image/')
                ? [
                    { width: 2000, height: 2000, crop: 'limit' },
                    { quality: 'auto:good' },
                    { fetch_format: 'auto' },
                  ]
                : undefined,
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          )
          .end(file.buffer);
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error: any) {
      throw new AppError(`Cloudinary upload failed: ${error.message}`, 500);
    }
  }

  /**
   * Upload to AWS S3
   */
  private async uploadToS3(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    if (!s3Client) {
      throw new AppError('S3 client not configured', 500);
    }

    try {
      const ext = path.extname(file.originalname);
      const key = `${folder}/${randomUUID()}${ext}`;

      const command = new PutObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      });

      await s3Client.send(command);

      const url = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

      return {
        url,
        key,
      };
    } catch (error: any) {
      throw new AppError(`S3 upload failed: ${error.message}`, 500);
    }
  }

  /**
   * Delete file from cloud storage
   */
  async deleteFile(publicId?: string, key?: string, useCloudinary: boolean = true): Promise<void> {
    if (useCloudinary && publicId && env.CLOUDINARY_CLOUD_NAME) {
      await this.deleteFromCloudinary(publicId);
    } else if (!useCloudinary && key && s3Client) {
      await this.deleteFromS3(key);
    }
  }

  /**
   * Delete from Cloudinary
   */
  private async deleteFromCloudinary(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error: any) {
      console.error('Cloudinary delete error:', error);
      // Don't throw error for delete failures
    }
  }

  /**
   * Delete from S3
   */
  private async deleteFromS3(key: string): Promise<void> {
    if (!s3Client) return;

    try {
      const command = new DeleteObjectCommand({
        Bucket: env.AWS_S3_BUCKET,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error: any) {
      console.error('S3 delete error:', error);
      // Don't throw error for delete failures
    }
  }

  /**
   * Save media file record to database
   */
  async saveMediaFile(
    filePath: string,
    filename: string,
    originalName: string,
    mimeType: string,
    size: number,
    fileType: string,
    uploadedBy?: string
  ) {
    const mediaFile = await prisma.mediaFile.create({
      data: {
        filePath,
        filename,
        originalName,
        mimeType,
        fileSize: size,
        fileType,
        uploadedBy,
      },
    });

    return mediaFile;
  }

  /**
   * Get all media files with pagination and filters
   */
  async getAllMediaFiles(
    page: number = 1,
    limit: number = 20,
    fileType?: string,
    uploadedBy?: string
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (fileType) where.fileType = fileType;
    if (uploadedBy) where.uploadedBy = uploadedBy;

    const [mediaFiles, total] = await Promise.all([
      prisma.mediaFile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.mediaFile.count({ where }),
    ]);

    return { mediaFiles, total };
  }

  /**
   * Get media file by ID
   */
  async getMediaFileById(id: string) {
    const mediaFile = await prisma.mediaFile.findUnique({
      where: { id },
    });

    if (!mediaFile) {
      throw new AppError('Media file not found', 404);
    }

    return mediaFile;
  }

  /**
   * Delete media file
   */
  async deleteMediaFile(id: string) {
    const mediaFile = await this.getMediaFileById(id);

    // Note: Cloud storage files are not automatically deleted
    // You may want to implement cleanup logic based on your cloud storage service

    // Delete from database
    await prisma.mediaFile.delete({
      where: { id },
    });

    return { message: 'Media file deleted successfully' };
  }
}
