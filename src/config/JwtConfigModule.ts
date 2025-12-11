import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [
      JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: (config: ConfigService) => ({
          secret: config.get<string>('APP_SECRET'),
          signOptions: { expiresIn: '1d' },
        }),
        inject: [ConfigService],
      }),
    ],
    exports: [JwtModule],
  })
  export class JwtConfigModule {}