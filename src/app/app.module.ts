import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PairsModule } from './pairs/pairs.module';
import { SessionsModule } from './sessions/sessions.module';
import { ElementsModule } from './elements/elements.module';
import { TradingPlansModule } from './trading-plans/trading-plans.module';
import { StrategiesModule } from './strategies/strategies.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        PairsModule,
        SessionsModule,
        StrategiesModule,
        ElementsModule,
        TradingPlansModule,
    ],
    exports: [],
    controllers: [],
    providers: [],
})
export class AppModule {}
