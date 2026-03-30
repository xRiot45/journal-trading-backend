import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SessionResponseDto {
    @ApiProperty({ example: '2fad9d0f1-9d3d-4d3d-9d3d-9d3d9d3d9d3d', description: 'The id of the session' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'London Session', description: 'The name of the session' })
    @Expose()
    name: string;

    @ApiProperty({ example: '09:00', description: 'The start time of the session' })
    @Expose()
    startTime: string;

    @ApiProperty({ example: '17:00', description: 'The end time of the session' })
    @Expose()
    endTime: string;

    @ApiProperty({ example: 'Session for London market', description: 'A brief description of the session' })
    @Expose()
    description: string;

    @ApiProperty({ example: '2023-08-01T00:00:00.000Z', description: 'The creation date of the session' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ example: '2023-08-01T00:00:00.000Z', description: 'The update date of the session' })
    @Expose()
    updatedAt: Date;
}
