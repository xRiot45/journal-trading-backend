import { Body, Controller, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { StrategiesService } from './strategies.service';

@Controller('strategies')
@UseGuards(JwtAuthGuard)
export class StrategiesController {
    constructor(private readonly strategiesService: StrategiesService) {}
}
