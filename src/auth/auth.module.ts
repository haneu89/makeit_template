import { Module, forwardRef } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtRoleModule } from '../shared/jwt';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { OAuthModule } from './oauth/oauth.module';

@Module({
  imports: [UserModule, JwtRoleModule, PrismaModule, forwardRef(() => OAuthModule)],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService]
})
export class AuthModule {}
