import { PairEntity } from 'src/app/pairs/entities/pair.entity';
import { StrategyEntity } from 'src/app/strategies/entities/strategy.entity';
import { BaseEntity } from 'src/shared/entities/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { TradeDirection } from '../common/enum/trade-direction.enum';
import { TradeStatus } from '../common/enum/trade-status.enum';
import { BasedOnPlan } from '../common/enum/based-on-plan.enum';

@Entity('journals')
export class JournalEntity extends BaseEntity {
    @Column({
        type: 'date',
        nullable: false,
        comment: 'Trading date',
    })
    date: Date;

    @Column({
        type: 'enum',
        enum: TradeDirection,
        nullable: false,
        comment: 'Trade direction: Buy or Sell',
    })
    direction: TradeDirection;

    @Column({
        type: 'enum',
        enum: TradeStatus,
        nullable: false,
        comment: 'Trade result status: Profit, Loss, or Draw',
    })
    status: TradeStatus;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Lot size used in this trade',
    })
    lotSize: number;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Entry price of the trade',
    })
    entryPrice: number;

    @Column({
        type: 'time',
        nullable: false,
        comment: 'Time when the trade was entered',
    })
    entryTime: string;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Closing price of the trade',
    })
    closingPrice: number;

    @Column({
        type: 'time',
        nullable: false,
        comment: 'Time when the trade was closed',
    })
    closingTime: string;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Take Profit level',
    })
    takeProfit: number;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Stop Loss level',
    })
    stopLoss: number;

    @Column({
        type: 'float',
        nullable: false,
        comment: 'Profit and Loss value in cent currency format',
    })
    profitAndLoss: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: 'Risk ratio of the trade',
    })
    riskRatio: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        comment: 'Reward ratio of the trade',
    })
    rewardRatio: number;

    @Column({
        type: 'tinyint',
        width: 1,
        nullable: false,
        default: BasedOnPlan.NO,
        comment: 'Whether the trade was based on a plan: 1 = Yes, 0 = No',
    })
    basedOnPlan: BasedOnPlan;

    @Column({
        type: 'text',
        nullable: true,
        comment: 'Additional notes about this trade',
    })
    note: string | null;

    @Column({
        nullable: false,
        comment: 'Foreign key referencing PairEntity',
    })
    pairId: string;

    @ManyToOne(() => PairEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'pairId' })
    pair: PairEntity;

    @Column({
        nullable: false,
        comment: 'Foreign key referencing StrategyEntity',
    })
    strategyId: string;

    @ManyToOne(() => StrategyEntity, { eager: false, onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'strategyId' })
    strategy: StrategyEntity;
}
