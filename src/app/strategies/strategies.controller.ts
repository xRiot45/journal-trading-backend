import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StrategiesService } from './strategies.service';
import { StrategiesRequestDto } from './dto/req/strategies-request.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { StrategiesResponseDto } from './dto/res/strategies-response.dto';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Strategies')
@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategiesController {
    constructor(private readonly strategiesService: StrategiesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDocGenericResponse({
        summary: 'Create a new strategy',
        description: 'Create a new strategy trading',
        auth: true,
        body: StrategiesRequestDto,
        response: StrategiesResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'application/json',
        produces: 'application/json',
    })
    async create(@Body() dto: StrategiesRequestDto): Promise<BaseResponseDto<StrategiesResponseDto>> {
        const result = await this.strategiesService.create(dto);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Strategy created successfully',
            data: result,
        };
    }
}
