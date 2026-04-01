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

    async findAll(): Promise<TradingPlanResponseDto[]> {
        const context = `${TradingPlansService.name}.findAll`;

        try {
            const tradingPlans = await this.tradingPlanRepository.find({
                relations: ['pair'],
            });

            return tradingPlans.map(plan => mapToDto(TradingPlanResponseDto, plan));
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error retrieving trading plans: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to retrieve trading plans');
        }
    }

    async findOne(tradingPlanId: string): Promise<TradingPlanResponseDto> {
        const context = `${TradingPlansService.name}.findOne`;

        try {
            const tradingPlan = await this.tradingPlanRepository.findOne({
                where: { id: tradingPlanId },
                relations: ['pair'],
            });

            if (!tradingPlan) {
                this.logger.warn(`Trading plan with id ${tradingPlanId} not found`, context);
                throw new NotFoundException(`Trading plan with id ${tradingPlanId} not found`);
            }

            return mapToDto(TradingPlanResponseDto, tradingPlan);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error retrieving trading plan: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to retrieve trading plan');
        }
    }

    async update(
        tradingPlanId: string,
        dto: TradingPlanRequestDto,
        file?: Express.Multer.File,
    ): Promise<TradingPlanResponseDto> {
        const context = `${TradingPlansService.name}.update`;

        let newFilePath: string | null = null;
        let oldFilePath: string | null = null;

        try {
            const tradingPlan = await this.tradingPlanRepository.findOne({
                where: { id: tradingPlanId },
                relations: ['pair'],
            });

            if (!tradingPlan) {
                this.logger.warn(`Trading plan with id ${tradingPlanId} not found`, context);
                throw new NotFoundException(`Trading plan with id ${tradingPlanId} not found`);
            }

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

            oldFilePath = tradingPlan.thumbnailUrl ?? null;

            if (file) {
                newFilePath = normalizeFilePath(file.path);
            }

            tradingPlan.title = dto.title;
            tradingPlan.date = new Date(dto.date).toISOString().split('T')[0];
            tradingPlan.description = dto.description;
            tradingPlan.pair = pair;

            if (newFilePath) {
                tradingPlan.thumbnailUrl = newFilePath;
            }

            const result = await this.tradingPlanRepository.save(tradingPlan);

            if (newFilePath && oldFilePath) {
                await deleteFile(oldFilePath);
            }

            return mapToDto(TradingPlanResponseDto, result);
        } catch (error) {
            if (newFilePath) {
                await deleteFile(newFilePath);
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error updating trading plan: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to update trading plan');
        }
    }

    async remove(tradingPlanId: string): Promise<void> {
        const context = `${TradingPlansService.name}.remove`;

        try {
            const tradingPlan = await this.tradingPlanRepository.findOne({
                where: { id: tradingPlanId },
            });

            if (!tradingPlan) {
                this.logger.warn(`Trading plan with id ${tradingPlanId} not found`, context);
                throw new NotFoundException(`Trading plan with id ${tradingPlanId} not found`);
            }

            if (tradingPlan.thumbnailUrl) {
                await deleteFile(tradingPlan.thumbnailUrl);
            }

            await this.tradingPlanRepository.delete(tradingPlanId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error deleting trading plan: ${errorMessage}`, context, errorStack);

            throw new InternalServerErrorException('Failed to delete trading plan');
        }
    }
}
