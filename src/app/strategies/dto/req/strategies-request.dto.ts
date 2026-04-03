import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class StrategiesRequestDto {
    @ApiProperty({ example: 'Sample Strategy trading', description: 'The title of the strategy' })
    @IsNotEmpty({ message: 'Title cannot be empty' })
    @IsString()
    @MaxLength(100, { message: 'Title maximum 100 characters' })
    title: string;

    @ApiProperty({ example: 'This is a sample strategy', description: 'The description of the strategy' })
    @IsString()
    @MaxLength(250, { message: 'Maximum description 250 characters' })
    @IsOptional()
    description?: string;
}
