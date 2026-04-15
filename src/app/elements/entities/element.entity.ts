import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { StrategyEntity } from 'src/app/strategies/entities/strategy.entity';

export enum ElementType {
    NODE = 'node', // node mind map
    EDGE = 'edge', // connector antar node
}

@Entity('elements')
export class ElementEntity extends BaseEntity {
    @Column({ name: 'strategyId' })
    strategyId: string;

    @Column({ type: 'enum', enum: ElementType })
    type: ElementType;

    @Column({ name: 'identifier', type: 'varchar', nullable: false, comment: 'Judul dari node' })
    identifier: string;

    @Column({ type: 'float', default: 0 })
    x: number;

    @Column({ type: 'float', default: 0 })
    y: number;

    @Column({ type: 'float', default: 160 })
    width: number;

    @Column({ type: 'float', default: 60 })
    height: number;

    @Column({ name: 'zIndex', type: 'int', default: 0 })
    zIndex: number;

    @Column({ name: 'parentElementId', nullable: true })
    parentElementId: string | null;

    @Column({ name: 'isLocked', default: false })
    isLocked: boolean;

    @Column({ name: 'isVisible', default: true })
    isVisible: boolean;

    // ---- Relations ----

    @ManyToOne(() => StrategyEntity, d => d.elements, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'strategyId' })
    strategy: StrategyEntity;

    @ManyToOne(() => ElementEntity, e => e.children, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'parentElementId' })
    parent: ElementEntity;

    @OneToMany(() => ElementEntity, e => e.parent)
    children: ElementEntity[];
}
