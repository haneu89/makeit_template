import { Module } from '@nestjs/common';
import { PreferenceController } from './preference.controller';
import { PreferenceService } from './preference.service';
import { PrismaModule } from '../../shared/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PreferenceController],
  providers: [PreferenceService],
})
export class PreferenceModule {} 