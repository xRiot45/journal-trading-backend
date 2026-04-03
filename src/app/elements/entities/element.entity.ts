import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { StrategyEntity } from 'src/app/strategies/entities/strategy.entity';

export enum ElementType {
    NODE = 'node', // node mind map
    EDGE = 'edge', // connector antar node
}

@Entity('elements')
export class ElementEntity extends BaseEntity {
    @Column({ name: 'document_id' })
    documentId: string;

    @Column({ type: 'enum', enum: ElementType })
    type: ElementType;

    @Column({ type: 'float', default: 0 })
    x: number;

    @Column({ type: 'float', default: 0 })
    y: number;

    @Column({ type: 'float', default: 100 })
    width: number;

    @Column({ type: 'float', default: 100 })
    height: number;

    @Column({ name: 'z_index', type: 'int', default: 0 })
    zIndex: number;

    // Styling: color, fill, stroke, fontSize, opacity, dll
    @Column({ name: 'style_data', type: 'json', nullable: true })
    styleData: Record<string, any>;

    // Konten: label teks node, source/target untuk edge, dll
    @Column({ name: 'content_data', type: 'json', nullable: true })
    contentData: Record<string, any>;

    // Self-referencing untuk parent node mind map
    @Column({ name: 'parent_element_id', nullable: true })
    parentElementId: string;

    @Column({ name: 'is_locked', default: false })
    isLocked: boolean;

    @Column({ name: 'is_visible', default: true })
    isVisible: boolean;

    // Relations
    @ManyToOne(() => StrategyEntity, d => d.elements, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'document_id' })
    strategy: StrategyEntity;

    @ManyToOne(() => ElementEntity, e => e.children, { nullable: true })
    @JoinColumn({ name: 'parent_element_id' })
    parent: ElementEntity;

    @OneToMany(() => ElementEntity, e => e.parent)
    children: ElementEntity[];
}
