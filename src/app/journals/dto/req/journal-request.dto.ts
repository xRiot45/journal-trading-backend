// journal.dto.ts

import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TradeDirection } from '../../common/enum/trade-direction.enum';
import { TradeStatus } from '../../common/enum/trade-status.enum';
import { BasedOnPlan } from '../../common/enum/based-on-plan.enum';

export class JournalRequestDto {
    // ---- Date ----
    @ApiProperty({
        description: 'Trading date',
        example: '2025-01-15',
        type: String,
        format: 'date',
    })
    @IsNotEmpty()
    @IsDate()
    @Type(() => Date)
    date: Date;

    // ---- Direction ----
    @ApiProperty({
        description: 'Trade direction',
        enum: TradeDirection,
        example: TradeDirection.BUY,
    })
    @IsNotEmpty()
    @IsEnum(TradeDirection)
    direction: TradeDirection;

    // ---- Status ----
    @ApiProperty({
        description: 'Trade result status',
        enum: TradeStatus,
        example: TradeStatus.PROFIT,
    })
    @IsNotEmpty()
    @IsEnum(TradeStatus)
    status: TradeStatus;

    // ---- Lot Size ----
    @ApiProperty({
        description: 'Lot size used in this trade',
        example: 0.1,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    lotSize: number;

    // ---- Entry ----
    @ApiProperty({
        description: 'Entry price of the trade',
        example: 1.2345,
        type: Number,
    })
    @IsNotEmpty()
    @IsNumber()
    entryPrice: number;

    @ApiProperty({
        description: 'Time when the trade was entered (HH:mm:ss)',
        example: '08:30:00',
        type: String,
    })
    @IsNotEmpty()
    @IsString()
    entryTime: string;

    // ---- Closing ----
    @ApiPropertyOptional({
        description: 'Closing price of the trade',
        example: 1.24,
        type: Number,
    })
    @IsNumber()
    closingPrice: number;

    @ApiPropertyOptional({
        description: 'Time when the trade was closed (HH:mm:ss)',
        example: '10:45:00',
        type: String,
    })
    @IsString()
    closingTime: string;

    // ---- TP & SL ----
    @ApiPropertyOptional({
        description: 'Take Profit level',
        example: 1.25,
        type: Number,
    })
    @IsNumber()
    takeProfit: number;

    @ApiPropertyOptional({
        description: 'Stop Loss level',
        example: 1.23,
        type: Number,
    })
    @IsNumber()
    stopLoss: number;

    // ---- PnL ----
    @ApiPropertyOptional({
        description: 'Profit and Loss value in cent currency format',
        example: 55.0,
        type: Number,
    })
    @IsNumber()
    profitAndLoss: number;

    // ---- Risk & Reward Ratio ----
    @ApiPropertyOptional({
        description: 'Risk ratio of the trade',
        example: 1.5,
        type: Number,
    })
    @IsNumber()
    riskRatio: number;

    @ApiPropertyOptional({
        description: 'Reward ratio of the trade',
        example: 2.5,
        type: Number,
    })
    @IsNumber()
    rewardRatio: number;

    // ---- Based on Plan ----
    @ApiProperty({
        description: 'Whether the trade was based on a plan',
        enum: BasedOnPlan,
        example: BasedOnPlan.YES,
        default: BasedOnPlan.NO,
    })
    @IsNotEmpty()
    @IsEnum(BasedOnPlan)
    basedOnPlan: BasedOnPlan;

    // ---- Note ----
    @ApiPropertyOptional({
        description: 'Additional notes about this trade',
        example: 'Entered on strong bullish momentum after breakout.',
        type: String,
        nullable: true,
    })
    @IsOptional()
    @IsString()
    note?: string | null;

    // ---- Relations ----
    @ApiProperty({
        description: 'Foreign key referencing PairEntity',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsNotEmpty()
    pairId: string;

    @ApiPropertyOptional({
        description: 'Foreign key referencing StrategyEntity',
        example: '550e8400-e29b-41d4-a716-446655440000',
    })
    @IsNotEmpty()
    strategyId: string;
}

export class CreateJournalRequestDto extends JournalRequestDto {}

export class UpdateJournalRequestDto extends PartialType(JournalRequestDto) {}
