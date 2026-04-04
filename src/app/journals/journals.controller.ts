import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JournalsService } from './journals.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CreateJournalRequestDto, UpdateJournalRequestDto } from './dto/req/journal-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { JournalResponseDto } from './dto/res/journal-response.dto';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Journals')
@UseGuards(JwtAuthGuard)
@Controller('journals')
export class JournalsController {
    constructor(private readonly journalsService: JournalsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDocGenericResponse({
        summary: 'Create Journal',
        description: 'Create Journal',
        auth: true,
        body: CreateJournalRequestDto,
        response: JournalResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'application/json',
        produces: 'application/json',
    })
    async create(@Body() dto: CreateJournalRequestDto): Promise<BaseResponseDto<JournalResponseDto>> {
        const result = await this.journalsService.create(dto);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Journal created successfully',
            data: result,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Get Journals',
        description: 'Get Journals',
        auth: true,
        response: JournalResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
        queries: [
            { name: 'page', type: 'number', required: false },
            { name: 'limit', type: 'number', required: false },
            { name: 'search', type: 'string', required: false },
            { name: 'sortBy', type: 'string', required: false },
            { name: 'order', type: 'string', required: false },
        ],
    })
    async findAll(@Query() query: PaginationQueryDto): Promise<BaseResponseDto<JournalResponseDto[]>> {
        const result = await this.journalsService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Journals fetched successfully',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get(':journalId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Get Journal by ID',
        description: 'Get Journal by ID',
        auth: true,
        response: JournalResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
        params: [{ name: 'journalId', type: 'string', required: true }],
    })
    async findOne(@Param('journalId') journalId: string): Promise<BaseResponseDto<JournalResponseDto>> {
        const result = await this.journalsService.findOne(journalId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Journal fetched successfully',
            data: result,
        };
    }

    @Patch(':journalId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Update Journal by ID',
        description: 'Update Journal by ID',
        auth: true,
        response: JournalResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
        params: [{ name: 'journalId', type: 'string', required: true }],
    })
    async update(
        @Param('journalId') journalId: string,
        @Body() dto: UpdateJournalRequestDto,
    ): Promise<BaseResponseDto<JournalResponseDto>> {
        const result = await this.journalsService.update(journalId, dto);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Journal updated successfully',
            data: result,
        };
    }

    @Delete(':journalId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Delete Journal by ID',
        description: 'Delete Journal by ID',
        auth: true,
        response: BaseResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
        params: [{ name: 'journalId', type: 'string', required: true }],
    })
    async delete(@Param('journalId') journalId: string): Promise<BaseResponseDto> {
        await this.journalsService.delete(journalId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Journal deleted successfully',
        };
    }
}
