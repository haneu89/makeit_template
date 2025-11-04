import { Module } from '@nestjs/common';
import { AttachmentModule } from './attachment/attachment.module';
import { PrismaModule } from './shared/prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { JwtRoleModule } from './shared/jwt/jwt-role.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PreferenceModule } from './admin/preference/preference.module';
import { ConfigModule } from '@nestjs/config';
import { LogModule, LogLevel } from './shared/log';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    LogModule.forRoot({
      level: process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG,
      transports: (() => {
        const transports = process.env.NODE_ENV === 'production'
          ? ['console', 'file']
          : ['console'];
        // Add Sentry if DSN is configured
        if (process.env.SENTRY_DSN) {
          transports.push('sentry');
        }
        return transports as any;
      })(),
      fileRotation: {
        maxFiles: parseInt(process.env.LOG_MAX_FILES || '0', 10), // 0 = no auto-delete
        maxSize: process.env.LOG_MAX_SIZE || '10m',
      },
      logDir: process.env.LOG_DIR || './storage/logs',
      excludePaths: ['/health', '/api/metrics'],
      sentryDsn: process.env.SENTRY_DSN,
    }),
    PrismaModule,
    AttachmentModule,
    AdminModule,
    JwtRoleModule,
    AuthModule,
    UserModule,
    PreferenceModule,
  ],
  providers: [],
  controllers: []
})
export class AppModule {}
