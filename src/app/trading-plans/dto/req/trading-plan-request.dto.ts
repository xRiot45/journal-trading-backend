import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsUUID, Matches, MaxLength } from 'class-validator';

export class TradingPlanRequestDto {
    @ApiProperty({
        description: 'Title of the trading plan',
        example: 'My Trading Plan',
    })
    @IsString()
    @MaxLength(255)
    title: string;

    @ApiProperty({
        description: 'Date of the trading plan',
        example: '2023-01-01',
    })
    @IsDateString()
    @Matches(/^\d{4}-\d{2}-\d{2}$/, {
        message: 'date must be in YYYY-MM-DD format',
    })
    date: string;

    @ApiProperty({
        description: 'ID of the associated pair',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsString()
    @IsUUID()
    pairId: string;

    @ApiProperty({
        description: 'Description of the trading plan',
        example: 'This is a detailed description of my trading plan.',
    })
    @IsString()
    description: string;

    // @ApiProperty({
    //     description: 'Thumbnail image file for the trading plan',
    //     type: 'string',
    //     format: 'binary',
    // })
    // thumbnail: any;
}
