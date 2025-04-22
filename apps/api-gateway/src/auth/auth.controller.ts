// apps/api-gateway/src/users.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from '../users/dto/register.dto';
import { LoginDto } from '../users/dto/login.dto';


@ApiTags('Users')
@Controller('auth')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly users: ClientProxy) {}

  /* ---------- Авторизация ---------- */

  @Post('register')
  @ApiOperation({ summary: 'Регистрация' })
  @ApiResponse({ status: 201 })
  register(@Body() dto: RegisterDto) {
    return firstValueFrom(this.users.send({ cmd: 'register-user' }, dto));
  }

  @Post('login')
  @ApiOperation({ summary: 'Логин' })
  login(@Body() dto: LoginDto) {
    return firstValueFrom(this.users.send({ cmd: 'login-user' }, dto));
  }
}
