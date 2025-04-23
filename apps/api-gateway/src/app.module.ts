import { Module } from '@nestjs/common';
import { GatewayController } from './gateway.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersController } from './users/users.controller';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: cfg.get('USERS_SERVICE_HOST'),
            port: cfg.get<number>('USERS_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
      {
        name: 'CORE_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: cfg.get('CORE_SERVICE_HOST'),
            port: cfg.get<number>('CORE_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
    PassportModule,
  ],
  controllers: [GatewayController, UsersController, AuthController],
  providers: [AppService, JwtStrategy],
  exports: [JwtStrategy],
})
export class AppModule {}

