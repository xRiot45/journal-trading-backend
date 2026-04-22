import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, UseGuards } from '@nestjs/common';
import { ElementsService } from './elements.service';
import { ApiDocGenericResponse } from 'src/common/decorators/api-doc.decorator';
import { UpsertElementDto } from './dto/req/element.dto';
import { ElementResponseDto } from './dto/res/element-response.dto';
import { BaseResponseDto } from 'src/shared/dto/base-response.dto';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Elements')
@Controller('elements')
@UseGuards(JwtAuthGuard)
export class ElementsController {
    constructor(private readonly elementsService: ElementsService) {}

    @Get('strategy/:strategyId')
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
    async getAllElementsByStrategyID(
        @Param('strategyId') strategyId: string,
    ): Promise<BaseResponseDto<ElementResponseDto[]>> {
        const result = await this.elementsService.getAllElementsByStrategyID(strategyId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Elements retrieved successfully',
            data: result,
        };
    }

    @Put('node')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Upsert node (Create / Update / Move)',
        description:
            'Create new node if ID is not provided. Update node properties or move node (change parent) if ID is provided.',
        auth: true,
        body: UpsertElementDto,
        response: ElementResponseDto,
        status: HttpStatus.OK,
    })
    async upsertNode(@Body() dto: UpsertElementDto): Promise<BaseResponseDto<ElementResponseDto>> {
        const result = await this.elementsService.upsertNode(dto);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Node Upserted Successfully!',
            data: result,
        };
    }

    @Delete(':elementId')
    @HttpCode(HttpStatus.OK)
    @ApiDocGenericResponse({
        summary: 'Delete an element',
        description: 'Delete an element by ID',
        auth: true,
        status: HttpStatus.OK,
        produces: 'application/json',
        params: [
            {
                name: 'elementId',
                description: 'ID of the element to delete',
                required: true,
                type: 'string',
            },
        ],
    })
    async removeElement(@Param('elementId') elementId: string): Promise<BaseResponseDto> {
        await this.elementsService.removeElement(elementId);
        return {
            success: true,
            statusCode: HttpStatus.OK,
            timestamp: new Date(),
            message: 'Element deleted successfully',
        };
    }
}
