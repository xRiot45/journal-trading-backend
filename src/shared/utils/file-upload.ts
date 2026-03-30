import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import * as fs from 'fs';
import { diskStorage, StorageEngine } from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const BASE_UPLOAD_PATH = process.env.UPLOAD_DESTINATION || path.join(process.cwd(), 'public', 'uploads');

const DEFAULT_ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * GENERIC FILE FILTER
 */
export const fileFilter = (allowedMimeTypes: string[] = DEFAULT_ALLOWED_MIME) => {
    return (
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error | null, acceptFile: boolean) => void,
    ): void => {
        const isValidMime = allowedMimeTypes.includes(file.mimetype);

        if (!isValidMime) {
            return callback(
                new BadRequestException(`File format not supported! Allowed: ${allowedMimeTypes.join(', ')}`),
                false,
            );
        }

        callback(null, true);
    };
};

/**
 * GENERATE UNIQUE FILE NAME
 */
export const editFileName = (
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error | null, filename: string) => void,
): void => {
    const fileExtName = path.extname(file.originalname);
    const randomName = uuidv4();

    callback(null, `${randomName}${fileExtName}`);
};

/**
 * STORAGE CONFIG (dynamic folder)
 */
export const createStorageConfig = (folderName: string): StorageEngine => {
    const uploadPath = path.join(BASE_UPLOAD_PATH, folderName);

    return diskStorage({
        destination: (req, file, cb) => {
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }
            cb(null, uploadPath);
        },
        filename: editFileName,
    });
};

/**
 * DELETE FILE HELPER
 */
export const deleteFile = async (filePath: string | null | undefined): Promise<void> => {
    if (!filePath) return;

    try {
        const cleanPath = filePath.replace(/^.*public\/uploads\//, '').replace(/^\//, '');

        const fullPath = path.join(BASE_UPLOAD_PATH, cleanPath);

        if (fs.existsSync(fullPath)) {
            await fs.promises.unlink(fullPath);
            console.log(`[File Utils] Successfully deleted: ${fullPath}`);
        }
    } catch (error) {
        console.error(`[File Utils] Failed to delete file at ${filePath}`, error);
    }
};

export const normalizeFilePath = (filePath: string): string => {
    return filePath.replace(/\\/g, '/').replace(/^.*public/, '');
};
