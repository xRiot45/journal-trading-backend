import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PairEntity } from './entities/pair.entity';
import { FindOptionsOrder, ILike, Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { PairDto } from './dto/req/pair-request.dto';
import { PairResponseDto } from './dto/res/pair-response.dto';
import { mapToDto } from 'src/shared/utils/transformer.util';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { PaginationResponse } from 'src/shared/interfaces/pagination.interface';
import { paginate } from 'src/shared/utils/pagination.util';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class PairService {
    constructor(
        @InjectRepository(PairEntity)
        private readonly pairRepository: Repository<PairEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: PairDto): Promise<PairResponseDto> {
        const context = `${PairService.name}.create`;
        const { name, description } = dto;

        try {
            const existingPair = await this.pairRepository.findOne({
                where: { name },
            });

            if (existingPair) {
                this.logger.warn(`Pair with name ${name} already exists`, context);
                throw new ConflictException(`Pair with name ${name} already exists`);
            }

            const pair = this.pairRepository.create({ name, description });
            const result = await this.pairRepository.save(pair);
            return mapToDto(PairResponseDto, result);
        } catch (error) {
            if (error instanceof ConflictException) throw error;

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error creating pair: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }

    async findAll(query: PaginationQueryDto): Promise<PaginationResponse<PairResponseDto>> {
        const context = `${PairService.name}.findAll`;
        try {
            const allowedSortFields = ['name', 'createdAt', 'updatedAt'];
            const sortBy = allowedSortFields.includes(query.sortBy ?? '') ? (query.sortBy ?? '') : 'createdAt';

            const whereCondition = query?.search ? { name: ILike(`%${query.search}%`) } : {};

            const result = await paginate(this.pairRepository, query, {
                where: whereCondition,
                order: { [sortBy]: query.order ?? 'ASC' } as FindOptionsOrder<PairEntity>,
            });

            return {
                data: plainToInstance(PairResponseDto, result.data, {
                    excludeExtraneousValues: true,
                }),
                meta: result.meta,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error fetching pairs: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }

    async findOne(id: string): Promise<PairResponseDto> {
        const context = `${PairService.name}.findOne`;
        try {
            const pair = await this.pairRepository.findOne({
                where: { id },
            });

            if (!pair) {
                this.logger.warn(`Pair with id ${id} not found`, context);
                throw new NotFoundException(`Pair with id ${id} not found`);
            }

            return mapToDto(PairResponseDto, pair);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error fetching pair: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }
}
