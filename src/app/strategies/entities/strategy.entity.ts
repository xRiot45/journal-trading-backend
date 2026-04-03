import { BaseEntity } from 'src/shared/entities/base.entity';
import { Entity, Column, OneToMany } from 'typeorm';
import { ElementEntity } from 'src/app/elements/entities/element.entity';

@Entity('documents')
export class StrategyEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'longtext',
        nullable: true,
    })
    content?: string | null;

    @Column({
        type: 'varchar',
        length: 250,
        nullable: true,
    })
    description?: string;

    @Column({
        type: 'date',
        nullable: true,
    })
    lastEditedAt: Date;

    @OneToMany(() => ElementEntity, e => e.strategy)
    elements: ElementEntity[];
}
