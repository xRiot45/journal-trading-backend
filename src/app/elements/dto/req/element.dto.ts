import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';
import { ElementType } from '../../entities/element.entity';

export class ElementBaseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Canvas (strategy) ID' })
    @IsUUID()
    @IsNotEmpty()
    strategyId: string;

    @ApiProperty({ enum: ElementType, example: ElementType.NODE, description: 'node or edge' })
    @IsEnum(ElementType)
    @IsNotEmpty()
    type: ElementType;

    @ApiProperty({ example: 'My Node', description: 'Node title' })
    @IsNotEmpty()
    identifier: string;

    @ApiPropertyOptional({ example: 0, description: 'X position' })
    @IsNumber()
    @IsOptional()
    x?: number;

    @ApiPropertyOptional({ example: 0, description: 'Y position' })
    @IsNumber()
    @IsOptional()
    y?: number;

    @ApiPropertyOptional({ example: 160, description: 'Width' })
    @IsNumber()
    @IsOptional()
    width?: number;

    @ApiPropertyOptional({ example: 60, description: 'Height' })
    @IsNumber()
    @IsOptional()
    height?: number;

    @ApiPropertyOptional({ example: 0, description: 'Z-index' })
    @IsNumber()
    @IsOptional()
    zIndex?: number;

    @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Parent node ID' })
    @IsUUID()
    @IsOptional()
    parentElementId?: string;

    @ApiPropertyOptional({ example: false })
    @IsBoolean()
    @IsOptional()
    isLocked?: boolean;

    @ApiPropertyOptional({ example: true })
    @IsBoolean()
    @IsOptional()
    isVisible?: boolean;
}

export class UpsertElementDto extends PartialType(ElementBaseDto) {
    @ApiPropertyOptional({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'ID elemen. Jika diisi maka Update, jika kosong maka Create.',
    })
    @IsOptional()
    @IsUUID()
    id?: string;
}
