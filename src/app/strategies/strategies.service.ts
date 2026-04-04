import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StrategyEntity } from './entities/strategy.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { StrategiesRequestDto } from './dto/req/strategies-request.dto';
import { StrategiesResponseDto } from './dto/res/strategies-response.dto';
import { mapToDto } from 'src/shared/utils/transformer.util';

@Injectable()
export class StrategiesService {
    constructor(
        @InjectRepository(StrategyEntity)
        private readonly strategyRepository: Repository<StrategyEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: StrategiesRequestDto): Promise<StrategiesResponseDto> {
        const context = `${StrategiesService.name}.create`;

        try {
            const strategy = this.strategyRepository.create(dto);
            const result = await this.strategyRepository.save(strategy);
            return mapToDto(StrategiesResponseDto, result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error creating strategy: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }
}
