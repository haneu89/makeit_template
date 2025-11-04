import { Module, forwardRef } from '@nestjs/common';
import { OAuthController } from './oauth.controller';
import { AuthModule } from '../auth.module';

@Module({
  imports: [forwardRef(() => AuthModule)],
  controllers: [OAuthController],
  providers: [],
  exports: []
})
export class OAuthModule {}