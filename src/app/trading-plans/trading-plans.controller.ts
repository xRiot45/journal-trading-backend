import { Body, Controller, HttpCode, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
}
