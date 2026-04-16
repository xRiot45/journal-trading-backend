import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { CreateElementDto } from './dto/req/create-element.dto';
import { ElementResponseDto } from './dto/res/element-response.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Elements')
@Controller('elements')
@UseGuards(JwtAuthGuard)
export class ElementsController {
    constructor(private readonly elementsService: ElementsService) {}

    // POST /elements
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiDocGenericResponse({
        summary: 'Create a new element (node or edge)',
        description: 'For EDGE, contentData must include sourceId and targetId.',
        auth: true,
        body: CreateElementDto,
        response: ElementResponseDto,
        status: HttpStatus.CREATED,
        consumes: 'application/json',
        produces: 'application/json',
    })
    async create(@Body() dto: CreateElementDto): Promise<BaseResponseDto<ElementResponseDto>> {
        const result = await this.elementsService.createElement(dto);
        return {
            success: true,
            statusCode: HttpStatus.CREATED,
            timestamp: new Date(),
            message: 'Element created successfully',
            data: result,
        };
    }

    @Get(':strategyId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Get all elements for a strategy',
        description: 'Returns a list of nodes and edges associated with the specified strategy.',
        auth: true,
        response: [ElementResponseDto],
        status: HttpStatus.OK,
        produces: 'application/json',
        params: [
            {
                name: 'strategyId',
                description: 'ID of the strategy to retrieve elements for',
                required: true,
                type: 'string',
            },
        ],
    })
    async getElementsByStrategy(
        @Param('strategyId') strategyId: string,
    ): Promise<BaseResponseDto<ElementResponseDto[]>> {
        const result = await this.elementsService.getElementsByStrategy(strategyId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Elements retrieved successfully',
            data: result,
        };
    }
}
