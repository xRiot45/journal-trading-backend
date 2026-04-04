import { CreateJournalRequestDto } from './dto/req/journal-request.dto';
import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JournalEntity } from './entities/journal.entity';
import { FindOptionsOrder, ILike, Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { JournalResponseDto } from './dto/res/journal-response.dto';
import { PairEntity } from '../pairs/entities/pair.entity';
import { StrategyEntity } from '../strategies/entities/strategy.entity';
import { mapToDto } from 'src/shared/utils/transformer.util';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponse } from 'src/shared/interfaces/pagination.interface';
import { paginate } from 'src/shared/utils/pagination.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class JournalsService {
    constructor(
        @InjectRepository(JournalEntity)
        private readonly journalRepository: Repository<JournalEntity>,
        @InjectRepository(PairEntity)
        private readonly pairRepository: Repository<PairEntity>,
        @InjectRepository(StrategyEntity)
        private readonly strategyRepository: Repository<StrategyEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: CreateJournalRequestDto): Promise<JournalResponseDto> {
        const context = `${JournalsService.name}.create`;

        try {
            const pair: PairEntity | null = await this.pairRepository.findOne({
                where: { id: dto.pairId },
            });

            if (!pair) {
                this.logger.warn(`Pair with ID ${dto.pairId} not found`, context);
                throw new NotFoundException(`Pair with ID ${dto.pairId} not found`);
            }

            let strategy: StrategyEntity | null = null;

            if (dto.strategyId !== undefined && dto.strategyId !== null) {
                strategy = await this.strategyRepository.findOne({
                    where: { id: dto.strategyId },
                });

                if (!strategy) {
                    this.logger.warn(`Strategy with ID ${dto.strategyId} not found`, context);
                    throw new NotFoundException(`Strategy with ID ${dto.strategyId} not found`);
                }
            }

            const journal: JournalEntity = this.journalRepository.create({
                date: dto.date,
                direction: dto.direction,
                status: dto.status,
                lotSize: dto.lotSize,
                entryPrice: dto.entryPrice,
                entryTime: dto.entryTime,
                closingPrice: dto.closingPrice,
                closingTime: dto.closingTime,
                takeProfit: dto.takeProfit,
                stopLoss: dto.stopLoss,
                profitAndLoss: dto.profitAndLoss,
                riskRatio: dto.riskRatio,
                rewardRatio: dto.rewardRatio,
                basedOnPlan: dto.basedOnPlan,
                note: dto.note,
                pairId: pair.id,
                strategyId: strategy?.id,
            });

            const saved: JournalEntity = await this.journalRepository.save(journal);

            const result = await this.journalRepository.findOne({
                where: { id: saved.id },
                relations: { pair: true, strategy: true },
            });

            this.logger.log(`Journal created: ${JSON.stringify(saved)}`, context);

            return mapToDto(JournalResponseDto, result);
        } catch (error: unknown) {
            if (error instanceof NotFoundException) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error creating journal: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to create journal entry');
        }
    }

    async findAll(query: PaginationQueryDto): Promise<PaginationResponse<JournalResponseDto>> {
        const context = `${JournalsService.name}.findAll`;
        try {
            const allowedSortFields = ['date', 'createdAt', 'updatedAt'];
            const sortBy = allowedSortFields.includes(query.sortBy ?? '') ? (query.sortBy ?? '') : 'createdAt';

            const whereCondition = query?.search ? { note: ILike(`%${query.search}%`) } : {};
            const result = await paginate(this.journalRepository, query, {
                where: whereCondition,
                order: { [sortBy]: query.order ?? 'ASC' } as FindOptionsOrder<JournalEntity>,
                relations: ['pair', 'strategy'],
            });

            return {
                data: plainToInstance(JournalResponseDto, result.data, {
                    excludeExtraneousValues: true,
                }),
                meta: result.meta,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error fetching journals: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }

    async findOne(journalId: string): Promise<JournalResponseDto> {
        const context = `${JournalsService.name}.findOne`;
        try {
            const journal = await this.journalRepository.findOne({
                where: { id: journalId },
                relations: ['pair', 'strategy'],
            });

            if (!journal) {
                this.logger.warn(`Journal with ID ${journalId} not found`, context);
                throw new NotFoundException(`Journal with ID ${journalId} not found`);
            }

            return mapToDto(JournalResponseDto, journal);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error fetching journal: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }
}
