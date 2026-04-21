import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { ElementType } from '../../entities/element.entity';

/**
 * TreeNode — tipe rekursif untuk representasi tree JSON.
 * Digunakan sebagai return type dari getTree().
 */
export type TreeNode = {
    id: string;
    strategyId: string;
    identifier: string;
    type: ElementType;
    x: number;
    y: number;
    width: number;
    height: number;
    zIndex: number;
    depth: number;
    path: string | null;
    parentElementId: string | null;
    isLocked: boolean;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
    children: TreeNode[];
};

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

export class TreeResponseDto {
    @ApiProperty({ description: 'Daftar root node beserta seluruh subtree-nya' })
    roots: TreeNode[];

    @ApiProperty({ description: 'Total seluruh node dalam strategy' })
    total: number;
}

// export class CanvasResponseDto {
//     @ApiProperty({ description: 'Strategy (canvas) ID' })
//     strategyId: string;

//     @ApiProperty({ type: [ElementResponseDto] })
//     elements: ElementResponseDto[];

//     @ApiProperty({ example: 42 })
//     total: number;
// }

// export class BulkUpdateResultDto {
//     @ApiProperty({ example: 5 })
//     updated: number;

//     @ApiProperty({ type: [ElementResponseDto] })
//     elements: ElementResponseDto[];
// }
