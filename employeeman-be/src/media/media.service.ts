import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Media } from './media.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private mediaRepository: Repository<Media>,
  ) { }

  async uploadFile(file: Express.Multer.File, modelType: string = null, modelId: number = null, collectionName: string = null): Promise<Media> {
    const uuid = uuidv4();
    const fileName = `${uuid}-${file.originalname}`;
    const uploadPath = path.join(process.cwd(), 'uploads');

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    fs.writeFileSync(path.join(uploadPath, fileName), file.buffer);

    const media = new Media();
    media.uuid = uuid;
    media.modelType = modelType;
    media.modelId = modelId;
    media.collectionName = collectionName;
    media.name = file.originalname;
    media.fileName = fileName;
    media.mimeType = file.mimetype;
    media.disk = 'local';
    media.size = file.size;
    media.manipulations = {};
    media.customProperties = {};
    media.generatedConversions = {};
    media.responsiveImages = {};

    return this.mediaRepository.save(media);
  }

  async deleteFile(filename?: string, uuid?: string, modelId?: number, modelType?: string): Promise<void> {
    let media: Media | null = null;

    if (filename) {
      media = await this.mediaRepository.findOne({ where: { fileName: filename } });
    } else if (uuid) {
      media = await this.mediaRepository.findOne({ where: { uuid } });
    } else if (modelId && modelType) {
      media = await this.mediaRepository.findOne({ where: { modelId, modelType } });
    }

    if (!media) {
      throw new NotFoundException('Media tidak ditemukan');
    }

    const filePath = path.join(process.cwd(), 'uploads', media.fileName);

    // Hapus file dari sistem file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Hapus record dari database
    await this.mediaRepository.remove(media);
  }

  async getFile(filename: string): Promise<{ path: string; mimeType: string }> {
    const media = await this.mediaRepository.findOne({ where: { fileName: filename } });

    if (!media) {
      throw new NotFoundException('File tidak ditemukan');
    }

    const filePath = path.join(process.cwd(), 'uploads', media.fileName);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('File tidak ditemukan di sistem');
    }

    return { path: filePath, mimeType: media.mimeType };
  }
}