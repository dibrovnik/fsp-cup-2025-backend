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

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(@Inject('USERS_SERVICE') private readonly users: ClientProxy) {}

  /* ---------- Пользователи ---------- */

  @Get()
  list() {
    return firstValueFrom(this.users.send({ cmd: 'list-users' }, {}));
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return firstValueFrom(this.users.send({ cmd: 'get-user' }, id));
  }

  @Patch(':id')
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return firstValueFrom(this.users.send({ cmd: 'update-user' }, { id, dto }));
  }

  @Delete(':id')
  @ApiBearerAuth()
  delete(@Param('id') id: string) {
    return firstValueFrom(this.users.send({ cmd: 'delete-user' }, id));
  }

  /* ---------- Роли ---------- */

  @Post(':id/roles')
  @ApiBearerAuth()
  assignRole(@Param('id') id: string, @Body() dto: AssignRoleDto) {
    return firstValueFrom(this.users.send({ cmd: 'assign-role' }, { id, dto }));
  }

  @Get('roles')
  getRoles() {
    return firstValueFrom(this.users.send({ cmd: 'get-roles' }, {}));
  }
}
