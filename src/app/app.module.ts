import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PairsModule } from './pairs/pairs.module';
import { SessionsModule } from './sessions/sessions.module';

@Module({
    imports: [UsersModule, AuthModule, PairsModule, SessionsModule],
    exports: [],
    controllers: [],
    providers: [],
})
export class AppModule {}
