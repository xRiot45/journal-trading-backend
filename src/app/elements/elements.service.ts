import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElementEntity, ElementType } from './entities/element.entity';
import { StrategyEntity } from '../strategies/entities/strategy.entity';
import { Repository, DataSource } from 'typeorm';
import { StrategiesService } from '../strategies/strategies.service';
import { LoggerService } from 'src/core/logger/logger.service';
import { UpsertElementDto } from './dto/req/create-element.dto';
import { ElementResponseDto } from './dto/res/element-response.dto';
import { BulkUpdateItemDto } from './dto/req/update-element.dto';
import { CanvasHistoryEntity, HistoryActionType } from '../strategies/entities/canvas-history.entity';
import { plainToInstance } from 'class-transformer';

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

    // async createElement(dto: CreateElementDto): Promise<ElementResponseDto> {
    //     const context = `${ElementsService.name}.createElement`;

    //     // 1. Validasi  Strategy
    //     const strategy = await this.strategyRepository.findOne({
    //         where: {
    //             id: dto.strategyId,
    //         },
    //     });

    //     if (!strategy) {
    //         throw new NotFoundException(`Strategy (canvas) with id ${dto.strategyId} not found`);
    //     }

    //     // 2. Validasi Parent jika ada
    //     if (dto.parentElementId) {
    //         const parent = await this.elementRepository.findOne({
    //             where: { id: dto.parentElementId, strategyId: dto.strategyId, type: ElementType.NODE },
    //         });

    //         if (!parent) {
    //             throw new BadRequestException(`Parent node ${dto.parentElementId} not found in this canvas`);
    //         }
    //     }

    //     // 3. Snapshot sebelum create (untuk Undo/Redo)
    //     await this.strategiesService.pushSnapshot(
    //         dto.strategyId,
    //         HistoryActionType.CREATE_ELEMENT,
    //         `Create element: ${dto.identifier}`,
    //     );

    //     // 4. Mapping DTO ke Entity
    //     const element = this.elementRepository.create({
    //         strategyId: dto.strategyId,
    //         identifier: dto.identifier,
    //         type: dto.type,
    //         x: dto.x ?? 0,
    //         y: dto.y ?? 0,
    //         width: dto.width ?? 160,
    //         height: dto.height ?? 60,
    //         zIndex: dto.zIndex ?? 0,
    //         parentElementId: dto.parentElementId ?? null,
    //         isLocked: dto.isLocked ?? false,
    //         isVisible: dto.isVisible ?? true,
    //     });

    //     const saved = await this.elementRepository.save(element);

    //     // 5. Update timestamp strategy
    //     await this.strategyRepository.update(dto.strategyId, {
    //         lastEditedAt: new Date(),
    //     });

    //     this.logger.log(`Created element ${saved.id} (${saved.type}) in strategy ${dto.strategyId}`, context);
    //     return plainToInstance(ElementResponseDto, saved, {
    //         excludeExtraneousValues: true,
    //     });
    // }

    async getElementsByStrategy(strategyId: string): Promise<ElementResponseDto[]> {
        const elements = await this.elementRepository.find({
            where: { strategyId },
            order: { zIndex: 'ASC', createdAt: 'ASC' },
        });
        return elements.map(el => plainToInstance(ElementResponseDto, el, { excludeExtraneousValues: true }));
    }

    // async updateElementStrategy(
    //     elementId: string,
    //     strategyId: string,
    //     dto: UpdateElementDto,
    // ): Promise<ElementResponseDto> {
    //     const context = `${ElementsService.name}.updateElementStrategy`;

    //     const strategy = await this.strategyRepository.findOne({
    //         where: { id: strategyId },
    //     });

    //     if (!strategy) {
    //         this.logger.error(`Strategy (canvas) with id ${strategyId} not found`, context);
    //         throw new NotFoundException(`Strategy (canvas) with id ${strategyId} not found`);
    //     }

    //     const element = await this.elementRepository.findOne({
    //         where: {
    //             id: elementId,
    //             strategyId,
    //         },
    //     });

    //     if (!element) {
    //         throw new NotFoundException(`Element with id ${elementId} not found`);
    //     }

    //     if (dto.parentElementId) {
    //         const parent = await this.elementRepository.findOne({
    //             where: {
    //                 id: dto.parentElementId,
    //                 strategyId,
    //             },
    //         });

    //         if (!parent) {
    //             throw new NotFoundException(`Parent element with id ${dto.parentElementId} not found in this strategy`);
    //         }

    //         // Optional: cegah self-parenting
    //         if (dto.parentElementId === elementId) {
    //             throw new BadRequestException(`Element cannot be its own parent`);
    //         }
    //     }

    //     // 4. Merge update (hanya field yang dikirim)
    //     const updatedElement = this.elementRepository.merge(element, {
    //         ...dto,
    //     });

    //     // 5. Save ke database
    //     const saved = await this.elementRepository.save(updatedElement);

    //     // 6. Mapping ke response DTO
    //     return plainToInstance(ElementResponseDto, saved, {
    //         excludeExtraneousValues: true,
    //     });
    // }

    async upsertElement(dto: UpsertElementDto): Promise<ElementResponseDto> {
        const context = `${ElementsService.name}.upsertElement`;
        const { id, strategyId, parentElementId } = dto;

        if (!strategyId) {
            throw new BadRequestException('strategyId is required');
        }

        // 1. Validasi Strategy (Canvas)
        const strategy = await this.strategyRepository.findOne({ where: { id: strategyId } });
        if (!strategy) {
            throw new NotFoundException(`Strategy with id ${strategyId} not found`);
        }

        // 2. Validasi Parent (jika ada)
        if (parentElementId) {
            const parent = await this.elementRepository.findOne({
                where: { id: parentElementId, strategyId },
            });
            if (!parent) throw new BadRequestException(`Parent node ${parentElementId} not found`);
            if (id && parentElementId === id) throw new BadRequestException(`Element cannot be its own parent`);
        }

        let element: ElementEntity | null;

        // --- LOGIKA UTAMA (CREATE ATAU UPDATE) ---
        if (id) {
            element = await this.elementRepository.findOne({ where: { id, strategyId } });
            if (!element) throw new NotFoundException(`Element with id ${id} not found in this strategy`);
            this.elementRepository.merge(element, dto);
        } else {
            element = this.elementRepository.create({
                ...dto,
                x: dto.x ?? 0,
                y: dto.y ?? 0,
                width: dto.width ?? 160,
                height: dto.height ?? 60,
            });
        }

        // Simpan Elemen ke Database
        const saved = await this.elementRepository.save(element);

        // --- INLINE LOGIC PUSH SNAPSHOT ---
        // A. Ambil semua elemen terbaru di canvas ini untuk dijadikan snapshot data
        const currentElements = await this.elementRepository.find({
            where: { strategyId: strategyId },
        });

        // B. Cari index stack berikutnya (Logic getNextStackIndex)
        const lastHistory = await this.historyRepository.findOne({
            where: { strategyId: strategyId },
            order: { stackIndex: 'DESC' },
        });
        const nextIndex = lastHistory ? lastHistory.stackIndex + 1 : 0;

        // C. Simpan Snapshot Data (Logic pushSnapshotWithData)
        const historyLabel = id ? `Update element: ${saved.identifier}` : `Create element: ${saved.identifier}`;
        const actionType = id ? HistoryActionType.UPDATE_ELEMENT : HistoryActionType.CREATE_ELEMENT;

        await this.historyRepository.save({
            strategyId: strategyId,
            actionType: actionType,
            label: historyLabel,
            snapshot: JSON.stringify(currentElements), // Simpan seluruh state canvas
            stackIndex: nextIndex,
            createdAt: new Date(),
        });

        // --- UPDATE STRATEGY TIMESTAMP ---
        await this.strategyRepository.update(strategyId, { lastEditedAt: new Date() });

        this.logger.log(`${id ? 'Updated' : 'Created'} element ${saved.id} and pushed snapshot`, context);

        return plainToInstance(ElementResponseDto, saved, {
            excludeExtraneousValues: true,
        });
    }

    // ── PRIVATE HELPERS ────────────────────────────────────────────────────────

    private async findElementOrFail(id: string): Promise<ElementEntity> {
        const el = await this.elementRepository.findOne({ where: { id } });
        if (!el) throw new NotFoundException(`Element with id ${id} not found`);
        return el;
    }

    private async validateEdgeEndpoints(strategyId: string, sourceId: string, targetId: string): Promise<void> {
        if (sourceId === targetId) throw new BadRequestException('Source and target nodes cannot be the same');
        const [src, tgt] = await Promise.all([
            this.elementRepository.findOne({ where: { id: sourceId, strategyId, type: ElementType.NODE } }),
            this.elementRepository.findOne({ where: { id: targetId, strategyId, type: ElementType.NODE } }),
        ]);
        if (!src) throw new BadRequestException(`Source node ${sourceId} not found in this canvas`);
        if (!tgt) throw new BadRequestException(`Target node ${targetId} not found in this canvas`);
    }

    private async validateParentExists(strategyId: string, parentId: string): Promise<void> {
        const parent = await this.elementRepository.findOne({
            where: { id: parentId, strategyId, type: ElementType.NODE },
        });
        if (!parent) throw new BadRequestException(`Parent node ${parentId} not found in this canvas`);
    }

    private async assertNoCircularReference(elementId: string, newParentId: string): Promise<void> {
        let current: ElementEntity | null = await this.elementRepository.findOne({ where: { id: newParentId } });
        const visited = new Set<string>([elementId]);
        while (current) {
            if (visited.has(current.id)) throw new BadRequestException('Circular parent-child reference detected');
            visited.add(current.id);
            if (!current.parentElementId) break;
            current = await this.elementRepository.findOne({ where: { id: current.parentElementId } });
        }
    }

    private async collectDescendantIds(nodeId: string, repo: Repository<ElementEntity>): Promise<string[]> {
        const children = await repo.find({ where: { parentElementId: nodeId } });
        if (!children.length) return [];
        const childIds = children.map(c => c.id);
        const deeper = await Promise.all(childIds.map(id => this.collectDescendantIds(id, repo)));
        return [...childIds, ...deeper.flat()];
    }

    private applyBulkItem(element: ElementEntity, item: BulkUpdateItemDto): void {
        if (item.x !== undefined) element.x = item.x;
        if (item.y !== undefined) element.y = item.y;
        if (item.width !== undefined) element.width = item.width;
        if (item.height !== undefined) element.height = item.height;
        if (item.zIndex !== undefined) element.zIndex = item.zIndex;
        if (item.isLocked !== undefined) element.isLocked = item.isLocked;
        if (item.isVisible !== undefined) element.isVisible = item.isVisible;

        if (Object.prototype.hasOwnProperty.call(item, 'parentElementId')) {
            element.parentElementId = item.parentElementId ?? null;
        }
    }

    private async touchStrategy(strategyId: string): Promise<void> {
        await this.strategyRepository.update(strategyId, { lastEditedAt: new Date() });
    }
}
