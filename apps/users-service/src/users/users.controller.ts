// apps/users-service/src/users/users.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';
import { AssignRoleDto } from '../auth/dto/assign-role.dto';
import { AuthService } from '../auth/auth.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @MessagePattern('ping')
  ping(@Payload() payload: { test: string }) {
    console.log('🖐️  got PING');
    return 'pong ' + payload.test;
  }

  /* ---------- Авторизация ---------- */

  @MessagePattern('register-user')
  register(@Payload() payload: { dto: RegisterDto }) {
    return this.authService.register(payload.dto);
  }

  @MessagePattern('login-user')
  login(@Payload() payload: { dto: LoginDto }) {
    return this.authService.login(payload.dto);
  }

  /* ---------- Пользователи ---------- */

  @MessagePattern('get-user')
  getUser(@Payload() id: string) {
    return this.usersService.getUserById(id);
  }

  @MessagePattern('list-users' )
  listUsers() {
    return this.usersService.listUsers();
  }

  @MessagePattern('update-user' )
  updateUser(@Payload() data: { id: string; dto: UpdateUserDto }) {
    return this.usersService.updateUser(data.id, data.dto);
  }

  @MessagePattern('delete-user' )
  deleteUser(@Payload() id: string) {
    return this.usersService.deleteUser(id);
  }

  /* ---------- Роли ---------- */

  @MessagePattern('assign-role' )
  assignRole(@Payload() data: { id: string; dto: AssignRoleDto }) {
    return this.usersService.assignRole(data.id, data.dto.role);
  }

  @MessagePattern('get-roles')
  getRoles() {
    return this.usersService.getRoles();
  }
}
