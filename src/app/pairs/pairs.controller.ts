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
import { PairsService } from './pairs.service';
import { PairDto } from './dto/req/pair-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { PairResponseDto } from './dto/res/pair-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { PaginationMetaDto, PaginationQueryDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Pairs')
@UseGuards(JwtAuthGuard)
@Controller('pairs')
export class PairController {
    constructor(private readonly pairsService: PairsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDocGenericResponse({
        summary: 'Create a new pair',
        description: 'Create a new pair',
        auth: true,
        body: PairDto,
        response: PairResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'application/json',
        produces: 'application/json',
        customResponses: [
            {
                status: HttpStatus.BAD_REQUEST,
                description: 'Invalid input data.',
            },
            {
                status: HttpStatus.CONFLICT,
                description: 'Conflict: Pair with name already exists',
            },
            {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                description: 'Internal Server Error',
            },
        ],
    })
    async create(@Body() dto: PairDto): Promise<BaseResponseDto<PairResponseDto>> {
        const result = await this.pairsService.create(dto);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Pair created successfully',
            data: result,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Find all pairs',
        description: 'Find all pairs',
        auth: true,
        response: PairResponseDto,
        isArray: true,
        meta: PaginationMetaDto,
        status: HttpStatus.OK,
        produces: 'application/json',
    })
    async findAll(@Query() query: PaginationQueryDto): Promise<BaseResponseDto<PairResponseDto[]>> {
        const result = await this.pairsService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Pairs fetched successfully',
            data: result.data,
            meta: result.meta,
        };
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Find pair by id',
        description: 'Find pair by id',
        auth: true,
        response: PairResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
    })
    async findOne(@Param('id') id: string): Promise<BaseResponseDto<PairResponseDto>> {
        const result = await this.pairsService.findOne(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Pair fetched successfully',
            data: result,
        };
    }

    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Update pair by id',
        description: 'Update pair by id',
        auth: true,
        response: PairResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
    })
    async update(@Param('id') id: string, @Body() dto: PairDto): Promise<BaseResponseDto<PairResponseDto>> {
        const result = await this.pairsService.update(id, dto);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Pair updated successfully',
            data: result,
        };
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Delete pair by id',
        description: 'Delete pair by id',
        auth: true,
        response: BaseResponseDto,
        status: HttpStatus.OK,
        produces: 'application/json',
    })
    async remove(@Param('id') id: string): Promise<BaseResponseDto> {
        await this.pairsService.remove(id);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Pair deleted successfully',
        };
    }
}
