// apps/users-service/src/users/users.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RpcException } from '@nestjs/microservices';

import { AuthService } from '../auth/auth.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { LoginDto } from '../auth/dto/login.dto';
import { UpdateUserDto } from '../auth/dto/update-user.dto';

import { User } from './entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { UserRole } from '../auth/entities/user-role.entity';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,

    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
  ) {}

  /**
   * Получить пользователя по id (DTO для frontend)
   * @param id UUID пользователя
   */
  async getUserById(id: string) {
    this.logger.log(`[getUserById] Получение пользователя: ${id}`);
    let user: User;
    try {
      const foundUser = await this.userRepo.findOne({
        where: { id },
        relations: { region: true, userRoles: { role: true } },
      });
      if (!foundUser) {
        throw new RpcException({
          status: 404,
          message: 'Пользователь не найден',
        });
      }
      user = foundUser;
    } catch (e) {
      this.logger.error(
        `[getUserById] Ошибка поиска пользователя: ${e.message}`,
        e.stack,
      );
      throw new RpcException({
        status: 500,
        message: 'Ошибка поиска пользователя',
      });
    }
    if (!user) {
      this.logger.warn(`[getUserById] Пользователь не найден: ${id}`);
      throw new RpcException({
        status: 404,
        message: 'Пользователь не найден',
      });
    }

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

  /**
   * Получить список всех пользователей (DTO для frontend)
   */
  async listUsers() {
    this.logger.log('[listUsers] Получение списка пользователей');
    try {
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
    } catch (e) {
      this.logger.error(
        `[listUsers] Ошибка поиска пользователей: ${e.message}`,
        e.stack,
      );
      throw new RpcException({
        status: 500,
        message: 'Ошибка поиска пользователей',
      });
    }
  }

  /**
   * Обновить пользователя по id
   * @param id UUID пользователя
   * @param dto DTO для обновления
   */
  async updateUser(id: string, dto: UpdateUserDto) {
    this.logger.log(
      `[updateUser] Обновление пользователя ${id} с данными ${JSON.stringify(dto)}`,
    );
    try {
      const user = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        this.logger.warn(`[updateUser] Пользователь не найден: ${id}`);
        throw new RpcException({
          status: 404,
          message: 'Пользователь не найден',
        });
      }
      Object.assign(user, dto);
      await this.userRepo.save(user);
      return this.getUserById(id);
    } catch (e) {
      this.logger.error(
        `[updateUser] Ошибка обновления пользователя: ${e.message}`,
        e.stack,
      );
      throw new RpcException({
        status: 500,
        message: 'Ошибка обновления пользователя',
      });
    }
  }

  /**
   * Удалить пользователя по id
   * @param id UUID пользователя
   */
  async deleteUser(id: string) {
    this.logger.log(`[deleteUser] Удаление пользователя: ${id}`);
    try {
      const res = await this.userRepo.delete(id);
      if (!res.affected) {
        this.logger.warn(`[deleteUser] Пользователь не найден: ${id}`);
        throw new RpcException({
          status: 404,
          message: 'Пользователь не найден',
        });
      }
      return { deleted: id };
    } catch (e) {
      this.logger.error(
        `[deleteUser] Ошибка удаления пользователя: ${e.message}`,
        e.stack,
      );
      throw new RpcException({
        status: 500,
        message: 'Ошибка удаления пользователя',
      });
    }
  }

  /* ----------- РОЛИ ----------- */

  /**
   * Назначить пользователю роль (если ещё не назначена)
   * @param userId UUID пользователя
   * @param roleName Название роли (например, 'fsp')
   */
  async assignRole(userId: string, roleName: string) {
    this.logger.log(`[assignRole] userId=${userId}, roleName=${roleName}`);
    let user: any, role: any;
    try {
      user = await this.userRepo.findOne({
        where: { id: userId },
        relations: { userRoles: true },
      });
      if (!user) {
        this.logger.warn(`[assignRole] Пользователь не найден: ${userId}`);
        throw new RpcException({
          status: 404,
          message: 'Пользователь не найден',
        });
      }

      role = await this.roleRepo.findOne({ where: { name: roleName } });
      if (!role) {
        this.logger.warn(`[assignRole] Роль не найдена: ${roleName}`);
        throw new RpcException({
          status: 404,
          message: `Роль ${roleName} не найдена`,
        });
      }

      const already = await this.userRoleRepo.findOne({
        where: { user_id: user.id, role_id: role.id },
      });
      if (already) {
        this.logger.warn(
          `[assignRole] Пользователь уже имеет роль: ${roleName}`,
        );
        throw new RpcException({
          status: 409,
          message: `Пользователю уже назначена роль ${roleName}`,
        });
      }

      const link = this.userRoleRepo.create({ user, role });
      await this.userRoleRepo.save(link);
      this.logger.log(
        `[assignRole] Роль "${roleName}" успешно назначена пользователю ${userId}`,
      );
      return { ok: true };
    } catch (e) {
      if (e instanceof RpcException) throw e;
      this.logger.error(
        `[assignRole] Ошибка назначения роли: ${e.message}`,
        e.stack,
      );
      throw new RpcException({
        status: 500,
        message: 'Ошибка назначения роли',
      });
    }
  }

  /**
   * Получить список всех ролей
   */
  async getRoles() {
    this.logger.log('[getRoles] Получение списка ролей');
    try {
      return await this.roleRepo.find();
    } catch (e) {
      this.logger.error(
        `[getRoles] Ошибка поиска ролей: ${e.message}`,
        e.stack,
      );
      throw new RpcException({ status: 500, message: 'Ошибка поиска ролей' });
    }
  }
}
