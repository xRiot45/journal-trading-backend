import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

export class SessionDto {
    @ApiProperty({ example: 'London Session', description: 'The name of the session' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }: { value: string }) => value.trim())
    name: string;

    @ApiProperty({ example: '09:00', description: 'The start time of the session' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'startTime must be in HH:mm:ss (WIB) format',
    })
    startTime: string;

    @ApiProperty({ example: '17:00', description: 'The end time of the session' })
    @IsString()
    @IsNotEmpty()
    @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
        message: 'endTime must be in HH:mm:ss (WIB) format',
    })
    endTime: string;

    @ApiProperty({ example: 'Session for London market', description: 'A brief description of the session' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    description: string;
}
