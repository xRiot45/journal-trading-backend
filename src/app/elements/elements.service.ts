import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElementEntity, ElementType } from './entities/element.entity';
import { StrategyEntity } from '../strategies/entities/strategy.entity';
import { Repository, DataSource } from 'typeorm';
import { StrategiesService } from '../strategies/strategies.service';
import { LoggerService } from 'src/core/logger/logger.service';
import { UpsertElementDto } from './dto/req/create-element.dto';
import { ElementResponseDto } from './dto/res/element-response.dto';
import { CanvasHistoryEntity, HistoryActionType } from '../strategies/entities/canvas-history.entity';
import { plainToInstance } from 'class-transformer';
import { mapToDto } from 'src/shared/utils/transformer.util';

@Injectable()
export class ElementsService {
    constructor(
        @InjectRepository(ElementEntity)
        private readonly elementRepository: Repository<ElementEntity>,
        @InjectRepository(StrategyEntity)
        private readonly strategyRepository: Repository<StrategyEntity>,
        @InjectRepository(CanvasHistoryEntity)
        private readonly historyRepository: Repository<CanvasHistoryEntity>,
        private readonly strategiesService: StrategiesService,
        private readonly dataSource: DataSource,
        private readonly logger: LoggerService,
    ) {}

    async getAllElementsByStrategyID(strategyId: string): Promise<ElementResponseDto[]> {
        const elements = await this.elementRepository.find({
            where: { strategyId },
            order: { zIndex: 'ASC', createdAt: 'ASC' },
        });
        return elements.map(el => plainToInstance(ElementResponseDto, el, { excludeExtraneousValues: true }));
    }

    async upsertElement(dto: UpsertElementDto): Promise<ElementResponseDto> {
        const context = `${ElementsService.name}.upsertElement`;
        const { id, strategyId, parentElementId } = dto;

        if (!strategyId) {
            throw new BadRequestException('strategyId is required');
        }

        const strategy = await this.strategyRepository.findOne({
            where: { id: strategyId },
        });

        if (!strategy) {
            throw new NotFoundException(`Strategy with id ${strategyId} not found`);
        }

        if (parentElementId) {
            // Pastikan parent berada di dalam strategy yang sama
            const parent = await this.elementRepository.findOne({
                where: { id: parentElementId, strategyId },
            });

            if (!parent) {
                throw new BadRequestException(`Parent node ${parentElementId} not found`);
            }

            // Cegah element merujuk dirinya sendiri sebagai parent (circular reference)
            if (id && parentElementId === id) {
                throw new BadRequestException(`Element cannot be its own parent`);
            }
        }

        // ─── RESOLVE ELEMENT: Tentukan apakah operasi ini CREATE atau UPDATE ──────
        const isUpdate: boolean = !!id;
        let element: ElementEntity;

        if (isUpdate) {
            // UPDATE: Cari element existing, lalu merge dengan data dto terbaru
            const existing = await this.elementRepository.findOne({
                where: { id, strategyId },
            });

            if (!existing) {
                throw new NotFoundException(`Element with id ${id} not found in this strategy`);
            }

            element = this.elementRepository.merge(existing, dto);
        } else {
            // CREATE: Buat entity baru dengan nilai default dimensi jika tidak disertakan
            element = this.elementRepository.create({
                ...dto,
                x: dto.x ?? 0,
                y: dto.y ?? 0,
                width: dto.width ?? 160,
                height: dto.height ?? 60,
            });
        }

        const saved: ElementEntity = await this.elementRepository.save(element);
        const currentElements: ElementEntity[] = await this.elementRepository.find({
            where: { strategyId },
        });

        const lastHistory = await this.historyRepository.findOne({
            where: { strategyId },
            order: { stackIndex: 'DESC' },
        });

        const nextStackIndex: number = lastHistory ? lastHistory.stackIndex + 1 : 0;

        const actionType: HistoryActionType = isUpdate
            ? HistoryActionType.UPDATE_ELEMENT
            : HistoryActionType.CREATE_ELEMENT;

        await this.historyRepository.save({
            strategyId,
            actionType,
            label: `${isUpdate ? 'Update' : 'Create'} element: ${saved.identifier}`,
            snapshot: JSON.stringify(currentElements),
            stackIndex: nextStackIndex,
            createdAt: new Date(),
        });

        await this.strategyRepository.update(strategyId, {
            lastEditedAt: new Date(),
        });

        this.logger.log(`${isUpdate ? 'Updated' : 'Created'} element ${saved.id} and pushed snapshot`, context);
        return mapToDto(ElementResponseDto, saved);
    }

    async upsertNode(dto: UpsertElementDto): Promise<ElementResponseDto> {
        const context = `${ElementsService.name}.upsertNode`;
        const { id, strategyId, parentElementId } = dto;

        if (!strategyId) {
            throw new BadRequestException('strategyId is required');
        }

        const strategy = await this.strategyRepository.findOne({
            where: { id: strategyId },
        });

        if (!strategy) {
            throw new NotFoundException(`Strategy ${strategyId} not found`);
        }

        let parent: ElementEntity | null = null;

        // ─── VALIDATE PARENT ─────────────────────────────
        if (parentElementId) {
            parent = await this.elementRepository.findOne({
                where: {
                    id: parentElementId,
                    strategyId,
                    type: ElementType.NODE,
                },
            });

            if (!parent) {
                throw new BadRequestException(`Parent node ${parentElementId} not found`);
            }

            if (id && parentElementId === id) {
                throw new BadRequestException(`Node cannot be its own parent`);
            }
        }

        const isUpdate = !!id;

        // ----- CREATE ---------------------------------------
        if (!isUpdate) {
            const depth = parent ? parent.depth + 1 : 0;
            const path = parent ? (parent.path ? `${parent.path}/${parent.id}` : parent.id) : null;

            const node = this.elementRepository.create({
                strategyId,
                type: ElementType.NODE,
                identifier: dto.identifier ?? 'New Node',
                parentElementId: parentElementId ?? null,
                x: dto.x ?? 0,
                y: dto.y ?? 0,
                width: dto.width ?? 160,
                height: dto.height ?? 60,
                zIndex: dto.zIndex ?? 0,
                isLocked: dto.isLocked ?? false,
                isVisible: dto.isVisible ?? true,
                depth,
                path,
            });

            const saved = await this.elementRepository.save(node);

            await this.pushHistory(strategyId, HistoryActionType.CREATE_ELEMENT, `Create node: ${saved.identifier}`);

            await this.strategyRepository.update(strategyId, {
                lastEditedAt: new Date(),
            });

            this.logger.log(`Created node ${saved.id}`, context);
            return mapToDto(ElementResponseDto, saved);
        }

        // ----- UPDATE ---------------------------------------
        const existing = await this.elementRepository.findOne({
            where: { id, strategyId, type: ElementType.NODE },
        });

        if (!existing) {
            throw new NotFoundException(`Node ${id} not found`);
        }

        const isMoving = parentElementId !== undefined && parentElementId !== existing.parentElementId;

        // ─── HANDLE MOVE (CHANGE PARENT) ─────────────────────────
        if (isMoving) {
            // ❗ Cegah pindah ke descendant sendiri (circular)
            if (parent) {
                const parentNode = await this.elementRepository.findOne({
                    where: { id: parent.id },
                });

                if (parentNode?.path) {
                    const ancestors = parentNode.path.split('/');
                    if (ancestors.includes(existing.id)) {
                        throw new BadRequestException(`Cannot move node into its own descendant`);
                    }
                }

                if (parent.id === existing.id) {
                    throw new BadRequestException(`Node cannot be its own parent`);
                }
            }

            const newDepth = parent ? parent.depth + 1 : 0;
            const newPath = parent ? (parent.path ? `${parent.path}/${parent.id}` : parent.id) : null;

            existing.depth = newDepth;
            existing.path = newPath;
            existing.parentElementId = parentElementId ?? null;
        }

        // ─── UPDATE FIELD BIASA ───────────────────────────
        Object.assign(existing, {
            identifier: dto.identifier ?? existing.identifier,
            x: dto.x ?? existing.x,
            y: dto.y ?? existing.y,
            width: dto.width ?? existing.width,
            height: dto.height ?? existing.height,
            zIndex: dto.zIndex ?? existing.zIndex,
            isLocked: dto.isLocked ?? existing.isLocked,
            isVisible: dto.isVisible ?? existing.isVisible,
        });

        const saved = await this.elementRepository.save(existing);

        // ─── UPDATE SUBTREE (INLINE RECURSIVE) ───────────
        if (isMoving) {
            const stack: ElementEntity[] = [saved];

            while (stack.length > 0) {
                const current = stack.pop();

                if (!current) continue;

                const children = await this.elementRepository.find({
                    where: { parentElementId: current.id },
                });

                for (const child of children) {
                    const newDepth = current.depth + 1;
                    const newPath = current.path ? `${current.path}/${current.id}` : current.id;

                    await this.elementRepository.update(child.id, {
                        depth: newDepth,
                        path: newPath,
                    });

                    stack.push({
                        ...child,
                        depth: newDepth,
                        path: newPath,
                    });
                }
            }
        }

        await this.pushHistory(strategyId, HistoryActionType.UPDATE_ELEMENT, `Update node: ${saved.identifier}`);

        await this.strategyRepository.update(strategyId, {
            lastEditedAt: new Date(),
        });

        this.logger.log(`Updated node ${saved.id}`, context);

        return mapToDto(ElementResponseDto, saved);
    }

    // ---- PRIVATE HELPER ----------------------------------------

    private async pushHistory(strategyId: string, actionType: HistoryActionType, label: string): Promise<void> {
        const context = `${ElementsService.name}.pushHistory`;

        // Ambil semua element dalam strategy
        const elements = await this.elementRepository.find({
            where: { strategyId },
            order: { createdAt: 'ASC' }, // optional biar konsisten
        });

        // Ambil stackIndex terakhir
        const lastHistory = await this.historyRepository.findOne({
            where: { strategyId },
            order: { stackIndex: 'DESC' },
        });

        const nextStackIndex = lastHistory ? lastHistory.stackIndex + 1 : 0;

        // Simpan snapshot
        await this.historyRepository.save({
            strategyId,
            actionType,
            label,
            snapshot: JSON.stringify(elements),
            stackIndex: nextStackIndex,
            createdAt: new Date(),
        });

        this.logger.log(
            `Pushed history (strategy=${strategyId}, action=${actionType}, stackIndex=${nextStackIndex})`,
            context,
        );
    }
}
