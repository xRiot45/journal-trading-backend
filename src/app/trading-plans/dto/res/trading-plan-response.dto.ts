import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PairResponseDto } from 'src/app/pairs/dto/res/pair-response.dto';

export class TradingPlanResponseDto {
    @ApiProperty({
        example: '550e8400-e29b-41d4-a716-446655440000',
        description: 'The id of the trading plan',
    })
    @Expose()
    id: string;

    @ApiProperty({
        example: 'My Trading Plan',
        description: 'The title of the trading plan',
    })
    @Expose()
    title: string;

    @ApiProperty({
        example: '2023-01-01',
        description: 'The date of the trading plan',
    })
    @Expose()
    date: string;

    @Expose()
    @Type(() => PairResponseDto)
    pair: PairResponseDto;

    @ApiProperty({
        example: 'This is a detailed description of my trading plan.',
        description: 'The description of the trading plan',
    })
    @Expose()
    description: string;

    @ApiProperty({
        example: 'https://example.com/thumbnail.jpg',
        description: 'The thumbnail URL of the trading plan',
    })
    @Expose()
    thumbnailUrl: string;

    @ApiProperty({
        example: '2023-08-01T00:00:00.000Z',
        description: 'The creation date of the trading plan',
    })
    @Expose()
    createdAt: Date;

    @ApiProperty({
        example: '2023-08-01T00:00:00.000Z',
        description: 'The update date of the trading plan',
    })
    @Expose()
    updatedAt: Date;
}
