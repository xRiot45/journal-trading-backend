import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ElementType } from '../../entities/element.entity';

export class ElementResponseDto {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    strategyId: string;

    @ApiProperty()
    @Expose()
    identifier: string;

    @ApiProperty({ enum: ElementType })
    @Expose()
    type: ElementType;

    @ApiProperty()
    @Expose()
    x: number;

    @ApiProperty()
    @Expose()
    y: number;

    @ApiProperty()
    @Expose()
    width: number;

    @ApiProperty()
    @Expose()
    height: number;

    @ApiProperty()
    @Expose()
    zIndex: number;

    @ApiProperty({ description: 'Depth level: 0 = root, 1 = child, dst.' })
    @Expose()
    depth: number;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    path: string | null;

    @ApiPropertyOptional({ nullable: true })
    @Expose()
    parentElementId: string | null;

    @ApiProperty()
    @Expose()
    isLocked: boolean;

    @ApiProperty()
    @Expose()
    isVisible: boolean;

    @ApiPropertyOptional({ type: () => [ElementResponseDto], description: 'Children (canvas load only)' })
    @Expose()
    @Type(() => ElementResponseDto)
    children?: ElementResponseDto[];

    @ApiProperty()
    @Expose()
    createdAt: Date;

    @ApiProperty()
    @Expose()
    updatedAt: Date;
}
