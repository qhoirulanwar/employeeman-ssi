import { Controller, Post, UploadedFile, UseInterceptors, Delete, Query, Get, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaService } from './media.service';
import { Response } from 'express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.mediaService.uploadFile(file);
  }

  @Delete('delete')
  async deleteFile(
    @Query('filename') filename?: string,
    @Query('uuid') uuid?: string,
    @Query('model_id') modelId?: number,
    @Query('model_type') modelType?: string,
  ) {
    if (modelId && !modelType) {
      throw new Error('model_type is required when model_id is provided');
    }
    return this.mediaService.deleteFile(filename, uuid, modelId, modelType);
  }

  @Get('file/:filename')
  async getFile(@Param('filename') filename: string, @Res() res: Response) {
    const file = await this.mediaService.getFile(filename);
    res.sendFile(file.path);
  }
}