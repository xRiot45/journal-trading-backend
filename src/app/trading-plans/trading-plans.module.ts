import { Module } from '@nestjs/common';
import { TradingPlansService } from './trading-plans.service';
import { TradingPlansController } from './trading-plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TradingPlanEntity } from './entities/trading-plan.entity';
import { PairEntity } from '../pairs/entities/pair.entity';
import { LoggerService } from 'src/core/logger/logger.service';
import { JwtService } from '@nestjs/jwt';

@Module({
    imports: [TypeOrmModule.forFeature([TradingPlanEntity, PairEntity])],
    controllers: [TradingPlansController],
    providers: [TradingPlansService, LoggerService, JwtService],
})
export class TradingPlansModule {}
