import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DocumentResponseDto {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'The id of the document' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'Sample Document', description: 'The title of the document' })
    @Expose()
    title: string;

    @ApiProperty({ example: 'This is a sample document', description: 'The content of the document' })
    @Expose()
    content: string | null;

    @ApiProperty({ example: 'This is a sample document', description: 'The description of the document' })
    @Expose()
    description: string | null;

    @ApiProperty({ example: true, description: 'The isStarred of the document' })
    @Expose()
    isStarred: boolean;

    @ApiProperty({ example: '2022-01-01', description: 'The lastEditedAt of the document' })
    @Expose()
    lastEditedAt: Date;

    @ApiProperty({ example: '2023-08-01T00:00:00.000Z', description: 'The createdAt of the document' })
    @Expose()
    createdAt: Date;

    @ApiProperty({ example: '2023-08-01T00:00:00.000Z', description: 'The updatedAt of the document' })
    @Expose()
    updatedAt: Date;
}
