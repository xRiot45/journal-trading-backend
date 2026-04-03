import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StrategyEntity } from './entities/strategy.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';

@Injectable()
export class StrategiesService {
    constructor(
        @InjectRepository(StrategyEntity)
        private readonly strategyRepository: Repository<StrategyEntity>,
        private readonly logger: LoggerService,
    ) {}
}
