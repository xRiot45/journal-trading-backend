import { Module } from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { LoggerService } from 'src/core/logger/logger.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([SessionEntity])],
    controllers: [SessionsController],
    providers: [SessionsService, LoggerService, JwtService],
})
export class SessionsModule {}
