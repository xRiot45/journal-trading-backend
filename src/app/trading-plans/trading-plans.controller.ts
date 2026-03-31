import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { TradingPlansService } from './trading-plans.service';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { TradingPlanRequestDto } from './dto/req/trading-plan-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { TradingPlanResponseDto } from './dto/res/trading-plan-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { createStorageConfig, fileFilter } from 'src/shared/utils/file-upload';

@ApiTags('Trading Plans')
@UseGuards(JwtAuthGuard)
@Controller('trading-plans')
export class TradingPlansController {
    constructor(private readonly tradingPlansService: TradingPlansService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(
        FileInterceptor('thumbnail', {
            storage: createStorageConfig('trading-plans'),
            fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
            limits: {
                fileSize: 2 * 1024 * 1024, // 2MB
            },
        }),
    )
    @ApiDocGenericResponse({
        summary: 'Create a new trading plan',
        description: 'Create a new trading plan',
        auth: true,
        body: TradingPlanRequestDto,
        response: TradingPlanResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'multipart/form-data',
        produces: 'application/json',
    })
    async create(
        @Body() dto: TradingPlanRequestDto,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<BaseResponseDto<TradingPlanResponseDto>> {
        const result = await this.tradingPlansService.create(dto, file);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Trading plan created successfully',
            data: result,
        };
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Get all trading plans',
        description: 'Retrieve a list of all trading plans',
        auth: true,
        response: [TradingPlanResponseDto],
        status: HttpStatus.OK,
    })
    async findAll(): Promise<BaseResponseDto<TradingPlanResponseDto[]>> {
        const result = await this.tradingPlansService.findAll();
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Trading plans retrieved successfully',
            data: result,
        };
    }

    @Get(':tradingPlanId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Get a trading plan by ID',
        description: 'Retrieve a trading plan by its ID',
        auth: true,
        response: TradingPlanResponseDto,
        status: HttpStatus.OK,
    })
    async findOne(@Param('tradingPlanId') tradingPlanId: string): Promise<BaseResponseDto<TradingPlanResponseDto>> {
        const result = await this.tradingPlansService.findOne(tradingPlanId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Trading plan retrieved successfully',
            data: result,
        };
    }

    @Patch(':tradingPlanId')
    @HttpCode(HttpStatus.OK)
    @UseInterceptors(
        FileInterceptor('thumbnail', {
            storage: createStorageConfig('trading-plans'),
            fileFilter: fileFilter(['image/jpeg', 'image/png', 'image/webp']),
            limits: {
                fileSize: 2 * 1024 * 1024, // 2MB
            },
        }),
    )
    @ApiDocGenericResponse({
        summary: 'Update a trading plan',
        description: 'Update an existing trading plan by its ID',
        auth: true,
        body: TradingPlanRequestDto,
        response: TradingPlanResponseDto,
        status: HttpStatus.OK,
        consumes: 'multipart/form-data',
        produces: 'application/json',
    })
    async update(
        @Param('tradingPlanId') tradingPlanId: string,
        @Body() dto: TradingPlanRequestDto,
        @UploadedFile() file?: Express.Multer.File,
    ): Promise<BaseResponseDto<TradingPlanResponseDto>> {
        const result = await this.tradingPlansService.update(tradingPlanId, dto, file);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Trading plan updated successfully',
            data: result,
        };
    }
}
