import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PairsModule } from './pairs/pairs.module';
import { SessionsModule } from './sessions/sessions.module';
import { DocumentsModule } from './documents/documents.module';
import { ElementsModule } from './elements/elements.module';
import { CommentsModule } from './comments/comments.module';
import { AssetsModule } from './assets/assets.module';
import { TradingPlansModule } from './trading-plans/trading-plans.module';

@Module({
    imports: [
        UsersModule,
        AuthModule,
        PairsModule,
        SessionsModule,
        DocumentsModule,
        ElementsModule,
        CommentsModule,
        AssetsModule,
        TradingPlansModule,
    ],
    exports: [],
    controllers: [],
    providers: [],
})
export class AppModule {}
