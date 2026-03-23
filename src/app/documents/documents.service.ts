import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { DocumentRequestDto } from './dto/req/document-request.dto';
import { DocumentResponseDto } from './dto/res/document-response.dto';
import { mapToDto } from 'src/shared/utils/transformer.util';

@Injectable()
export class DocumentsService {
    constructor(
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: DocumentRequestDto): Promise<DocumentResponseDto> {
        const context = `${DocumentsService.name}.create`;

        try {
            const document = this.documentRepository.create(dto);
            const saved = await this.documentRepository.save(document);

            return mapToDto(DocumentResponseDto, saved);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error creating session: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }
}
