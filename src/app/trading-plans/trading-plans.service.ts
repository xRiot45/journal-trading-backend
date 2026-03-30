import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TradingPlanEntity } from './entities/trading-plan.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { TradingPlanRequestDto } from './dto/req/trading-plan-request.dto';
import { TradingPlanResponseDto } from './dto/res/trading-plan-response.dto';
import { PairEntity } from '../pairs/entities/pair.entity';
import { mapToDto } from 'src/shared/utils/transformer.util';
import { deleteFile, normalizeFilePath } from 'src/shared/utils/file-upload';

@Injectable()
export class TradingPlansService {
    constructor(
        @InjectRepository(TradingPlanEntity)
        private readonly tradingPlanRepository: Repository<TradingPlanEntity>,
        @InjectRepository(PairEntity)
        private readonly pairRepository: Repository<PairEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: TradingPlanRequestDto, file?: Express.Multer.File): Promise<TradingPlanResponseDto> {
        const context = `${TradingPlansService.name}.create`;

        let savedFilePath: string | null = null;

        try {
            const pair = await this.pairRepository.findOne({
                where: { id: dto.pairId },
            });

            if (!pair) {
                this.logger.warn(`Pair with id ${dto.pairId} not found`, context);
                throw new NotFoundException(`Pair with id ${dto.pairId} not found`);
            }

            if (file && !file.path) {
                this.logger.warn('File upload failed', context);
                throw new BadRequestException('File upload failed');
            }

            if (file) {
                savedFilePath = normalizeFilePath(file.path);
            }

            const tradingPlan = this.tradingPlanRepository.create({
                title: dto.title,
                date: new Date(dto.date).toISOString().split('T')[0],
                description: dto.description,
                thumbnailUrl: savedFilePath,
                pair,
            } as TradingPlanEntity);

            const result = await this.tradingPlanRepository.save(tradingPlan);

            return mapToDto(TradingPlanResponseDto, result);
        } catch (error) {
            if (savedFilePath) {
                await deleteFile(savedFilePath);
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error creating trading plan: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to create trading plan');
        }
    }
}
