import { Controller } from '@nestjs/common';
import { TradingPlansService } from './trading-plans.service';

@Controller('trading-plans')
export class TradingPlansController {
    constructor(private readonly tradingPlansService: TradingPlansService) {}
}
