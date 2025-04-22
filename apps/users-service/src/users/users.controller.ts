// apps/users-service/src/users/users.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { AssignRoleDto } from '../auth/dto/assign-role.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /* ---------- Авторизация ---------- */

  @MessagePattern({ cmd: 'register-user' })
  register(@Payload() dto: RegisterDto) {
    return this.usersService.register(dto); // использует AuthService внутренно
  }

  @MessagePattern({ cmd: 'login-user' })
  login(@Payload() dto: LoginDto) {
    return this.usersService.login(dto);
  }

  /* ---------- Пользователи ---------- */

  @MessagePattern({ cmd: 'get-user' })
  getUser(@Payload() id: string) {
    return this.usersService.getUserById(id);
  }

  @MessagePattern({ cmd: 'list-users' })
  listUsers() {
    return this.usersService.listUsers();
  }

  @MessagePattern({ cmd: 'update-user' })
  updateUser(@Payload() data: { id: string; dto: UpdateUserDto }) {
    return this.usersService.updateUser(data.id, data.dto);
  }

  @MessagePattern({ cmd: 'delete-user' })
  deleteUser(@Payload() id: string) {
    return this.usersService.deleteUser(id);
  }

  /* ---------- Роли ---------- */

  @MessagePattern({ cmd: 'assign-role' })
  assignRole(@Payload() data: { id: string; dto: AssignRoleDto }) {
    return this.usersService.assignRole(data.id, data.dto.role);
  }

  @MessagePattern({ cmd: 'get-roles' })
  getRoles() {
    return this.usersService.getRoles();
  }
}
