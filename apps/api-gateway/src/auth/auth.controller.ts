// apps/api-gateway/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Inject,
  Logger,
  Get,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';

@Controller('auth')
export class AuthController implements OnModuleInit {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  // Ждём, пока прокси поднимется
  async onModuleInit() {
    this.logger.log('Connecting to users-service RPC...');
    await this.usersClient.connect();
    this.logger.log('✅ Connected to users-service');
  }

  @Post('ping')
  async ping(@Body('test') test: string) {
    this.logger.log(`→ HTTP POST /api/auth/ping { test: "${test}" }`);
    try {
      const pong = await firstValueFrom(
        this.usersClient.send('ping', { test }),
      );
      this.logger.log(`← RPC pong: "${pong}"`);
      return { pong };
    } catch (err) {
      this.logger.error(`RPC ping failed`, err.stack || err);
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`→ HTTP POST /api/auth/register ${JSON.stringify(dto)}`);
    try {
      const result = await firstValueFrom(
        this.usersClient.send('register-user', { dto: dto }),
      );
      this.logger.log(`← RPC response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      this.logger.error(`← RPC error: ${JSON.stringify(err)}`);
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    this.logger.log(`→ HTTP POST /api/auth/login ${JSON.stringify(dto)}`);
    try {
      const result = await firstValueFrom(
        this.usersClient.send('login-user', { dto: dto }),
      );
      this.logger.log(`← RPC response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      this.logger.error(`← RPC error: ${JSON.stringify(err)}`);
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }
}

