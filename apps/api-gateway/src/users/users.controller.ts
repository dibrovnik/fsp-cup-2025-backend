import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Inject,
  OnModuleInit,
  Logger,
  UseGuards,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController implements OnModuleInit {
  private readonly logger = new Logger(UsersController.name);
  constructor(@Inject('USERS_SERVICE') private readonly users: ClientProxy) {}

  onModuleInit() {
    this.logger.log('Connecting to users-service...');
    this.users.connect();
    this.logger.log('Connected to users-service');
  }

  /** Получить список пользователей */
  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
  // @Roles('athlete', 'fsp')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiResponse({
    status: 200,
    description: 'Список пользователей',
    type: [RegisterDto],
  })
  list() {
    return firstValueFrom(this.users.send('list-users', {}));
  }

  /** Получить список всех ролей */
  @Get('roles')
  @ApiOperation({ summary: 'Получить список всех ролей' })
  @ApiResponse({
    status: 200,
    description: 'Список ролей',
    type: [AssignRoleDto],
  })
  getRoles() {
    return firstValueFrom(this.users.send('get-roles', {}));
  }

  /** Назначить пользователю роль */
  @Post('roles')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Назначить роль пользователю' })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 201, description: 'Роль назначена' })
  assignRole(@Body() dto: AssignRoleDto) {
    console.log('id', dto.id);
    console.log('role', dto.role);
    return firstValueFrom(
      this.users.send('assign-role', { id: dto.id, dto: { role: dto.role } }),
    );
  }

  // ![TODO] Решить проблему с обработкой ошибок в gRPC
  // @Post('roles')
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Назначить роль пользователю' })
  // @ApiBody({ type: AssignRoleDto })
  // @ApiResponse({ status: 201, description: 'Роль назначена' })
  // async assignRole(@Body() dto: AssignRoleDto) {
  //   try {
  //     return await firstValueFrom(
  //       this.users.send('assign-role', { id: dto.id, dto: { role: dto.role } }),
  //     );
  //   } catch (err: any) {
  //     // Если это RpcException — формат будет err.error
  //     if (err && err.error && err.error.status && err.error.message) {
  //       throw new HttpException(err.error.message, err.error.status);
  //     }
  //     // Иначе пробрасывай как 502
  //     throw new HttpException('Internal server error', HttpStatus.BAD_GATEWAY);
  //   }
  // }

  /** Получить пользователя по id */
  @Get(':id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiParam({ name: 'id', required: true, description: 'UUID пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Пользователь найден',
    type: RegisterDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  getOne(@Param('id') id: string) {
    return firstValueFrom(this.users.send('get-user', id));
  }

  /** Обновить пользователя */
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить пользователя по ID' })
  @ApiParam({ name: 'id', required: true, description: 'UUID пользователя' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Пользователь обновлен',
    type: RegisterDto,
  })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return firstValueFrom(this.users.send('update-user', { id, dto }));
  }

  /** Удалить пользователя */
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить пользователя по ID' })
  @ApiParam({ name: 'id', required: true, description: 'UUID пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь удалён' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  delete(@Param('id') id: string) {
    return firstValueFrom(this.users.send('delete-user', id));
  }
}
