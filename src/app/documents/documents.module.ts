import { Module } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEntity } from './entities/document.entity';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/core/logger/logger.service';

@Module({
    imports: [TypeOrmModule.forFeature([DocumentEntity])],
    controllers: [DocumentsController],
    providers: [DocumentsService, JwtService, LoggerService],
})
export class DocumentsModule {}
