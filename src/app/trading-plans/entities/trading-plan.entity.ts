import { PairEntity } from 'src/app/pairs/entities/pair.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('trading_plans')
export class TradingPlanEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'date',
        nullable: false,
        transformer: {
            to: (value: string) => value,
            from: (value: string) => value,
        },
    })
    date: string;

    @Column({
        type: 'text',
        nullable: false,
    })
    description: string;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: false,
    })
    thumbnailUrl: string;

    @Column()
    pairId: string;

    @ManyToOne(() => PairEntity, pair => pair.tradingPlans, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'pairId' })
    pair: PairEntity;
}
