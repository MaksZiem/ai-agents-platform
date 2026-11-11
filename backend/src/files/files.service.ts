import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeneratedFile } from './entities/generated-file.entity.js';

export interface NewGeneratedFile {
  userId: string;
  executionId: string;
  name: string;
  mimeType: string;
  content: string;
}

export interface FileWithContent {
  file: GeneratedFile;
  content: string;
}

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(GeneratedFile)
    private readonly filesRepository: Repository<GeneratedFile>,
  ) {}

  create(file: NewGeneratedFile): Promise<GeneratedFile> {
    return this.filesRepository.save(
      this.filesRepository.create({
        ...file,
        sizeBytes: Buffer.byteLength(file.content, 'utf8'),
      }),
    );
  }

  findAll(userId: string, executionId?: string): Promise<GeneratedFile[]> {
    return this.filesRepository.find({
      where: { userId, ...(executionId ? { executionId } : {}) },
      relations: { execution: { agent: true } },
      select: {
        id: true,
        executionId: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        createdAt: true,
        execution: { id: true, task: true, agent: { id: true, name: true } },
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<GeneratedFile> {
    const file = await this.filesRepository.findOneBy({ id, userId });

    if (!file) {
      throw new NotFoundException('File not found');
    }

    return file;
  }

  async findWithContent(
    id: string,
    where: { userId: string } | { executionId: string },
  ): Promise<FileWithContent | null> {
    const file = await this.filesRepository.findOne({
      where: { id, ...where },
      select: {
        id: true,
        userId: true,
        executionId: true,
        name: true,
        mimeType: true,
        sizeBytes: true,
        content: true,
        createdAt: true,
      },
    });

    if (!file) {
      return null;
    }

    const { content, ...metadata } = file;
    return { file: metadata as GeneratedFile, content };
  }

  async remove(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id, userId);
    await this.filesRepository.remove(file);
  }
}
