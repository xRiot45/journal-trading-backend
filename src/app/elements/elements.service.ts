import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ElementEntity, ElementType } from './entities/element.entity';
import { StrategyEntity } from '../strategies/entities/strategy.entity';
import { Repository } from 'typeorm';
import { LoggerService } from 'src/core/logger/logger.service';
import { UpsertElementDto } from './dto/req/element.dto';
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
        private readonly logger: LoggerService,
    ) {}

    async getAllElementsByStrategyID(strategyId: string): Promise<ElementResponseDto[]> {
        const elements = await this.elementRepository.find({
            where: { strategyId },
            order: { zIndex: 'ASC', createdAt: 'ASC' },
        });

        return elements.map(el =>
            plainToInstance(ElementResponseDto, el, {
                excludeExtraneousValues: true,
            }),
        );
    }

    async upsertNode(dto: UpsertElementDto): Promise<ElementResponseDto> {
        const context = `${ElementsService.name}.upsertNode`;
        const { id, strategyId, parentElementId } = dto;

        if (!strategyId) {
            throw new BadRequestException('strategyId is required');
        }

        // ─── 1. PARALLEL DEPENDENCY FETCHING ────────────────────────────────
        // Mengambil semua data validasi secara bersamaan untuk mengurangi I/O latency
        const [strategy, existingNode, parentNode] = await Promise.all([
            this.strategyRepository.findOne({ where: { id: strategyId } }),
            id
                ? this.elementRepository.findOne({ where: { id, strategyId, type: ElementType.NODE } })
                : Promise.resolve(null),
            parentElementId
                ? this.elementRepository.findOne({ where: { id: parentElementId, strategyId, type: ElementType.NODE } })
                : Promise.resolve(null),
        ]);

        if (!strategy) throw new NotFoundException(`Strategy ${strategyId} not found`);
        if (id && !existingNode) throw new NotFoundException(`Node ${id} not found`);
        if (parentElementId && !parentNode) throw new BadRequestException(`Parent node ${parentElementId} not found`);

        // ─── 2. CIRCULAR DEPENDENCY VALIDATION ──────────────────────────────
        if (id && parentElementId) {
            if (parentElementId === id) {
                throw new BadRequestException(`Node cannot be its own parent`);
            }
            if (parentNode?.path) {
                const ancestors: string[] = parentNode.path.split('/');
                if (ancestors.includes(id)) {
                    throw new BadRequestException(`Cannot move node into its own descendant`);
                }
            }
        }

        const isUpdate: boolean = !!id;
        const newDepth: number = parentNode ? parentNode.depth + 1 : 0;
        const newPath: string | null = parentNode
            ? parentNode.path
                ? `${parentNode.path}/${parentNode.id}`
                : parentNode.id
            : null;

        let savedNode: ElementEntity;
        let isMoving: boolean = false;

        // ─── 3. EXECUTE UPSERT (CREATE/UPDATE) ──────────────────────────────
        if (!isUpdate) {
            // [A] Create Logic
            const newNode: ElementEntity = this.elementRepository.create({
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
                depth: newDepth,
                path: newPath,
            });

            savedNode = await this.elementRepository.save(newNode);
            this.logger.log(`Created node ${savedNode.id}`, context);
        } else {
            // [B] Update Logic
            // Gunakan non-null assertion (!) karena `existingNode` sudah divalidasi di atas
            isMoving = parentElementId !== undefined && parentElementId !== existingNode!.parentElementId;

            if (isMoving) {
                existingNode!.depth = newDepth;
                existingNode!.path = newPath;
                existingNode!.parentElementId = parentElementId ?? null;
            }

            Object.assign(existingNode!, {
                identifier: dto.identifier ?? existingNode!.identifier,
                x: dto.x ?? existingNode!.x,
                y: dto.y ?? existingNode!.y,
                width: dto.width ?? existingNode!.width,
                height: dto.height ?? existingNode!.height,
                zIndex: dto.zIndex ?? existingNode!.zIndex,
                isLocked: dto.isLocked ?? existingNode!.isLocked,
                isVisible: dto.isVisible ?? existingNode!.isVisible,
            });

            savedNode = await this.elementRepository.save(existingNode!);
            this.logger.log(`Updated node ${savedNode.id}`, context);
        }

        // ─── 4. SUBTREE RECALCULATION (BULK OPTIMIZATION) ───────────────────
        if (isMoving) {
            // Membasmi N+1 Query: Tarik semua child HANYA 1x, proses di memory, Save 1x.
            const allStrategyNodes: ElementEntity[] = await this.elementRepository.find({
                where: { strategyId, type: ElementType.NODE },
                select: ['id', 'parentElementId', 'depth', 'path'], // Tarik kolom esensial saja untuk efisiensi RAM
            });

            // Bangun in-memory adjacency list (Map) untuk lookup child dengan kecepatan O(1)
            const childMap = new Map<string, ElementEntity[]>();
            for (const n of allStrategyNodes) {
                if (n.parentElementId) {
                    if (!childMap.has(n.parentElementId)) childMap.set(n.parentElementId, []);
                    childMap.get(n.parentElementId)!.push(n);
                }
            }

            const stack: ElementEntity[] = [savedNode];
            const nodesToUpdate: ElementEntity[] = [];

            // Traverse Tree in Memory
            while (stack.length > 0) {
                const current = stack.pop()!;
                const children = childMap.get(current.id) || [];

                for (const child of children) {
                    child.depth = current.depth + 1;
                    child.path = current.path ? `${current.path}/${current.id}` : current.id;

                    nodesToUpdate.push(child);
                    stack.push(child);
                }
            }

            // Bulk Save Subtree
            if (nodesToUpdate.length > 0) {
                await this.elementRepository.save(nodesToUpdate);
            }
        }

        // ─── 5. INLINED HISTORY PUSH (PARALLEL WRITE) ───────────────────────
        const actionType: HistoryActionType = isUpdate
            ? HistoryActionType.UPDATE_ELEMENT
            : HistoryActionType.CREATE_ELEMENT;

        const actionLabel: string = `${isUpdate ? 'Update' : 'Create'} node: ${savedNode.identifier}`;

        // Mengambil snapshot node TERBARU (setelah update subtree) dan index history terakhir secara bersamaan
        const [elementsSnapshot, lastHistory] = await Promise.all([
            this.elementRepository.find({
                where: { strategyId },
                order: { createdAt: 'ASC' },
            }),
            this.historyRepository.findOne({
                where: { strategyId },
                order: { stackIndex: 'DESC' },
            }),
        ]);

        const nextStackIndex: number = lastHistory ? lastHistory.stackIndex + 1 : 0;

        // Melakukan Insert History dan Update Strategy (timestamp) secara non-blocking
        await Promise.all([
            this.historyRepository.save({
                strategyId,
                actionType,
                label: actionLabel,
                snapshot: JSON.stringify(elementsSnapshot),
                stackIndex: nextStackIndex,
                createdAt: new Date(),
            }),
            this.strategyRepository.update(strategyId, {
                lastEditedAt: new Date(),
            }),
        ]);

        this.logger.log(
            `Pushed history (strategy=${strategyId}, action=${actionType}, stackIndex=${nextStackIndex})`,
            context,
        );

        // ─── 6. RETURN FORMATTED RESPONSE ───────────────────────────────────
        return mapToDto(ElementResponseDto, savedNode);
    }
}
