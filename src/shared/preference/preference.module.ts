import { Module, Global, DynamicModule } from '@nestjs/common';
import { PreferenceService } from './preference.service';
import { PreferenceOptions } from './preference.types';
import { PrismaModule } from '../prisma/prisma.module';

/**
 * Preference 캐시 모듈
 *
 * 애플리케이션 전역에서 사용할 수 있는 설정값 캐시 모듈입니다.
 * Preference 테이블의 데이터를 메모리에 캐싱하여 빠른 조회를 제공합니다.
 *
 * @version 1.0.0
 * @date 2024-12-26
 * @author jinhyung
 */
@Global()
@Module({
  imports: [PrismaModule],
  providers: [PreferenceService],
  exports: [PreferenceService],
})
export class PreferenceModule {
  /**
   * 기본 설정으로 모듈 등록
   */
  static forRoot(): DynamicModule {
    return {
      module: PreferenceModule,
      imports: [PrismaModule],
      providers: [PreferenceService],
      exports: [PreferenceService],
    };
  }

  /**
   * 커스텀 옵션으로 모듈 등록
   */
  static forRootAsync(options: PreferenceOptions): DynamicModule {
    return {
      module: PreferenceModule,
      imports: [PrismaModule],
      providers: [
        {
          provide: PreferenceService,
          useFactory: async (prisma) => {
            const service = new PreferenceService(prisma);
            service.setOptions(options);
            return service;
          },
          inject: [PrismaModule],
        },
      ],
      exports: [PreferenceService],
    };
  }
}