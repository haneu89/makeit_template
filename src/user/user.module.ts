import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../shared/prisma/prisma.module';
import { JwtRoleModule } from '../shared/jwt/jwt-role.module';

@Module({
  imports: [PrismaModule, JwtRoleModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
