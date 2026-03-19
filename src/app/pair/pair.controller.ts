import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, UseGuards } from '@nestjs/common';
import { PairService } from './pair.service';
import { PairDto } from './dto/req/pair-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { PairResponseDto } from './dto/res/pair-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { PaginationMetaDto, PaginationQueryDto } from 'src/shared/dto/pagination.dto';

@ApiTags('Pair')
@UseGuards(JwtAuthGuard)
@Controller('pair')
export class PairController {
    constructor(private readonly pairService: PairService) {}

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
        const result = await this.pairService.create(dto);
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
        const result = await this.pairService.findAll(query);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Pairs fetched successfully',
            data: result.data,
            meta: result.meta,
        };
    }
}
