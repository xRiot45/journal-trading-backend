import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { FindOptionsOrder, ILike, Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { SessionDto } from './dto/req/session-request.dto';
import { SessionResponseDto } from './dto/res/session-response.dto';
import { mapToDto } from 'src/shared/utils/transformer.util';
import { PaginationQueryDto } from 'src/shared/dto/pagination.dto';
import { plainToInstance } from 'class-transformer';
import { paginate } from 'src/shared/utils/pagination.util';
import { PaginationResponse } from 'src/shared/interfaces/pagination.interface';

@Injectable()
export class SessionsService {
    constructor(
        @InjectRepository(SessionEntity)
        private readonly sessionRepository: Repository<SessionEntity>,
        private readonly logger: LoggerService,
    ) {}

    async create(dto: SessionDto): Promise<SessionResponseDto> {
        const context = `${SessionsService.name}.create`;
        const { name, startTime, endTime } = dto;

        try {
            if (startTime === endTime) {
                this.logger.warn('startTime and endTime cannot be the same', context);
                throw new BadRequestException('startTime and endTime cannot be the same');
            }

            const existingSession = await this.sessionRepository.findOne({
                where: { name },
            });

            if (existingSession) {
                throw new ConflictException(`Session with name ${name} already exists`);
            }

            const session = this.sessionRepository.create({
                name,
                startTime,
                endTime,
            });

            const result = await this.sessionRepository.save(session);

            return mapToDto(SessionResponseDto, result);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error creating session: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }

    async findAll(query: PaginationQueryDto): Promise<PaginationResponse<SessionResponseDto>> {
        const context = `${SessionsService.name}.findAll`;

        try {
            const allowedSortFields = ['name', 'startTime', 'endTime', 'createdAt', 'updatedAt'];
            const sortByInput = query.sortBy;
            const sortBy = sortByInput && allowedSortFields.includes(sortByInput) ? sortByInput : 'createdAt';
            const order = query.order === 'DESC' ? 'DESC' : 'ASC';
            const search = query.search?.trim();

            const whereCondition = search ? { name: ILike(`%${search}%`) } : {};

            const result = await paginate(this.sessionRepository, query, {
                where: whereCondition,
                order: { [sortBy]: order } as FindOptionsOrder<SessionEntity>,
            });

            return {
                data: plainToInstance(SessionResponseDto, result.data, {
                    excludeExtraneousValues: true,
                }),
                meta: result.meta,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;

            this.logger.error(`Error fetching sessions: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }

    async findOne(sessionId: string): Promise<SessionResponseDto> {
        const context = `${SessionsService.name}.findOne`;

        try {
            const session = await this.sessionRepository.findOne({
                where: { id: sessionId },
            });

            if (!session) {
                this.logger.warn(`Session with id ${sessionId} not found`, context);
                throw new NotFoundException(`Session with id ${sessionId} not found`);
            }

            return mapToDto(SessionResponseDto, session);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            const errorStack = error instanceof Error ? error.stack : undefined;
            this.logger.error(`Error fetching session: ${errorMessage}`, context, errorStack);
            throw error;
        }
    }
}
