// apps/users-service/src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';

import { AuthService } from '../auth/auth.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

import { User } from './entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  /* ----------- USERS CRUD ----------- */

  async getUserById(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { region: true, userRoles: { role: true } },
    });
    if (!user) throw new NotFoundException('Пользователь не найден');

    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
    }));
    const userDto = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      roles,
    };
    return userDto;
  }

  async listUsers() {
    const users = await this.userRepo.find({
      relations: {
        region: true,
        userRoles: { role: true },
      },
    });

    return users.map((user) => {
      const roles = user.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      }));

      const { userRoles, ...rest } = user;
      return {
        ...rest,
        roles,
      };
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.getUserById(id);
    Object.assign(user, dto);
    await this.userRepo.save(user);
    return this.getUserById(id); 
  }

  async deleteUser(id: string) {
    const res = await this.userRepo.delete(id);
    if (!res.affected) throw new NotFoundException('Пользователь не найден');
    return { deleted: id };
  }

  /* ----------- РОЛИ ----------- */

  /** назначить пользователю роль (если ещё не назначена) */
  async assignRole(userId: string, roleName: string) {
    const user = await this.getUserById(userId);
    const role = await this.roleRepo.findOne({ where: { name: roleName } });
    if (!role) throw new NotFoundException(`Роль ${roleName} не найдена`);

    const already = await this.userRoleRepo.findOne({
      where: { user_id: user.id, role_id: role.id },
    });
    if (already)
      throw new BadRequestException('У пользователя уже есть такая роль');

    const link = this.userRoleRepo.create({ user, role });
    await this.userRoleRepo.save(link);
    return { ok: true };
  }

  /** вернуть список всех ролей */
  getRoles() {
    return this.roleRepo.find();
  }
}
