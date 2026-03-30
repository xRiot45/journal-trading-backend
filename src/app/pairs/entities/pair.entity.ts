import { TradingPlanEntity } from 'src/app/trading-plans/entities/trading-plan.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('pairs')
export class PairEntity extends BaseEntity {
    @Column({
        type: 'varchar',
        length: 100,
        nullable: false,
        unique: true,
    })
    name: string;

    @Column({
        type: 'varchar',
        length: 250,
        nullable: true,
    })
    description?: string;

    // ---- Relations ----

    @OneToMany(() => TradingPlanEntity, tradingPlan => tradingPlan.pair)
    tradingPlans: TradingPlanEntity[];
}
