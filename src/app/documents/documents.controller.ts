import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentRequestDto } from './dto/req/document-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { DocumentResponseDto } from './dto/res/document-response.dto';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
    constructor(private readonly documentsService: DocumentsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDocGenericResponse({
        summary: 'Create document',
        description: 'Create a new document',
        auth: true,
        body: DocumentRequestDto,
        response: DocumentResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'application/json',
        produces: 'application/json',
    })
    async create(@Body() dto: DocumentRequestDto): Promise<BaseResponseDto<DocumentResponseDto>> {
        const result = await this.documentsService.create(dto);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Document created successfully',
            data: result,
        };
    }
}
