import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  OnModuleInit,
  Inject,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController implements OnModuleInit {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    @Inject('USERS_SERVICE')
    private readonly usersClient: ClientProxy,
  ) {}

  async onModuleInit() {
    this.logger.log('Connecting to users-service RPC...');
    await this.usersClient.connect();
    this.logger.log('✅ Connected to users-service');
  }

  @Post('ping')
  @ApiOperation({ summary: 'Проверка соединения с users-service (ping)' })
  @ApiBody({
    schema: {
      example: { test: 'hello' },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Ответ pong от users-service',
    schema: { example: { pong: 'hello' } },
  })
  @ApiResponse({
    status: 502,
    description: 'RPC ошибка соединения с users-service',
  })
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
  @ApiOperation({ summary: 'Регистрация пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description:
      'Пользователь успешно зарегистрирован. Возвращает access_token.',
    schema: { example: { access_token: '...' } },
  })
  @ApiResponse({
    status: 502,
    description: 'Ошибка RPC/связи с users-service или ошибка регистрации.',
  })
  async register(@Body() dto: RegisterDto) {
    this.logger.log(`→ HTTP POST /api/auth/register ${JSON.stringify(dto)}`);
    try {
      const result = await firstValueFrom(
        this.usersClient.send('register-user', { dto }),
      );
      this.logger.log(`← RPC response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      this.logger.error(`← RPC error: ${JSON.stringify(err)}`);
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Авторизация пользователя (логин)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: 'Успешная авторизация. Возвращает access_token.',
    schema: { example: { access_token: '...' } },
  })
  @ApiResponse({
    status: 401,
    description: 'Неверный логин или пароль.',
  })
  @ApiResponse({
    status: 502,
    description: 'Ошибка RPC/связи с users-service.',
  })
  async login(@Body() dto: LoginDto) {
    this.logger.log(`→ HTTP POST /api/auth/login ${JSON.stringify(dto)}`);
    try {
      const result = await firstValueFrom(
        this.usersClient.send('login-user', { dto }),
      );
      this.logger.log(`← RPC response: ${JSON.stringify(result)}`);
      return result;
    } catch (err) {
      this.logger.error(`← RPC error: ${JSON.stringify(err)}`);
      throw new HttpException(err.message, HttpStatus.BAD_GATEWAY);
    }
  }
}
