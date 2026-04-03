import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { LoggerService } from 'src/core/logger/logger.service';
import { StrategyEntity } from './entities/strategy.entity';
import { StrategiesController } from './strategies.controller';
import { StrategiesService } from './strategies.service';

@Module({
    imports: [TypeOrmModule.forFeature([StrategyEntity])],
    controllers: [StrategiesController],
    providers: [StrategiesService, JwtService, LoggerService],
})
export class StrategiesModule {}
