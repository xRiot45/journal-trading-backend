import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class DocumentRequestDto {
    @ApiProperty({ example: 'Sample Document', description: 'The title of the document' })
    @IsNotEmpty({ message: 'Title cannot be empty' })
    @IsString()
    @MaxLength(100, { message: 'Title maximum 100 characters' })
    title: string;

    @ApiProperty({ example: 'This is a sample document', description: 'The content of the document' })
    @IsString()
    @MaxLength(250, { message: 'Maximum content 250 characters' })
    @IsOptional()
    description?: string;
}
