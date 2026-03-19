import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PaginationMetaDto } from './pagination.dto';

export class BaseResponseDto<T = void> {
    @Expose()
    @ApiProperty({ example: true, description: 'Success status' })
    success: boolean;

    @Expose()
    @ApiProperty({ example: 200, description: 'HTTP status code' })
    statusCode: number;

    @Expose()
    @ApiProperty({ example: 'Sample Messages!', description: 'Error message' })
    message?: string;

    @Expose()
    @Type(() => Date)
    @ApiProperty({ example: new Date().toISOString(), description: 'Timestamp' })
    timestamp: Date;

    @Expose()
    @ApiPropertyOptional()
    data?: T;

    @Expose()
    @ApiPropertyOptional()
    meta?: PaginationMetaDto;
}
