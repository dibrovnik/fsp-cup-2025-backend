import {
  Injectable,
  Logger,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';

import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '../users/entities/user.entity';

/**
 * AuthService — сервис регистрации, логина и генерации JWT-токенов
 * Все ошибки возвращаются как RpcException с логированием.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private jwt: JwtService,
  ) {}

  /**
   * Регистрация пользователя: создаёт пользователя и назначает роль "athlete"
   */
  async register(dto: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    regionId?: number;
  }) {
    this.logger.log(`[register] Регистрация: email=${dto.email}`);
    try {
      // Хэшируем пароль
      const hash = await bcrypt.hash(dto.password, 10);
      this.logger.debug(`[register] Пароль захеширован для ${dto.email}`);

      // Создаём пользователя
      const user = this.usersRepo.create({
        email: dto.email,
        password_hash: hash,
        first_name: dto.first_name,
        last_name: dto.last_name,
      });
      await this.usersRepo.save(user);
      this.logger.log(
        `[register] Пользователь создан: id=${user.id}, email=${user.email}`,
      );

      // Выдаём дефолтную роль athlete
      const athlete = await this.rolesRepo.findOne({
        where: { name: 'athlete' },
      });
      if (!athlete) {
        const msg = 'Роль "athlete" не найдена (не выполнен сидер ролей)';
        this.logger.error(`[register] ${msg}`);
        throw new RpcException({ status: 500, message: msg });
      }
      const link = this.userRoleRepo.create({ user, role: athlete });
      await this.userRoleRepo.save(link);

      // Загружаем пользователя с ролями
      const loadedUser = await this.loadUserWithRelations(user.id);
      if (!loadedUser) {
        const msg = `[register] Пользователь не найден после создания: id=${user.id}`;
        this.logger.error(msg);
        throw new RpcException({ status: 404, message: msg });
      }
      this.logger.log(
        `[register] Пользователь с ролями загружен: id=${loadedUser.id}`,
      );

      // Формируем DTO и токен
      const token = this.buildToken(loadedUser);
      const roles = loadedUser.userRoles.map((ur) => ({
        id: ur.role.id,
        name: ur.role.name,
      }));
      const userDto = {
        id: loadedUser.id,
        email: loadedUser.email,
        first_name: loadedUser.first_name,
        last_name: loadedUser.last_name,
        roles,
      };
      this.logger.log(
        `[register] Регистрация успешно завершена для email=${dto.email}`,
      );
      return { user: userDto, access_token: token };
    } catch (err) {
      this.logger.error(
        `[register] Ошибка регистрации для email=${dto.email}: ${err.message}`,
        err.stack || err,
      );
      throw new RpcException({
        status: 500,
        message: err.message || 'Ошибка регистрации пользователя',
      });
    }
  }

  /**
   * Логин пользователя по email и паролю, выдаёт JWT
   */
  async login(dto: { email: string; password: string }) {
    this.logger.log(`[login] Попытка логина: email=${dto.email}`);
    try {
      const user = await this.loadUserWithRelations({ email: dto.email });
      if (!user) {
        this.logger.warn(
          `[login] Пользователь не найден для email=${dto.email}`,
        );
        throw new UnauthorizedException('Неверные учётные данные');
      }
      const passwordValid = await bcrypt.compare(
        dto.password,
        user.password_hash,
      );
      if (!passwordValid) {
        this.logger.warn(`[login] Неверный пароль для email=${dto.email}`);
        throw new UnauthorizedException('Неверные учётные данные');
      }

      this.logger.log(
        `[login] Успешная аутентификация: id=${user.id}, email=${user.email}`,
      );
      const token = this.buildToken(user);
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
      return { user: userDto, access_token: token };
    } catch (err) {
      this.logger.error(
        `[login] Ошибка логина для email=${dto.email}: ${err.message}`,
        err.stack || err,
      );
      // Передаём статус 401, если ошибка — UnauthorizedException
      if (err instanceof UnauthorizedException) {
        throw new RpcException({ status: 401, message: err.message });
      }
      throw new RpcException({
        status: 500,
        message: err.message || 'Ошибка авторизации',
      });
    }
  }

  /**
   * Вспомогательная функция загрузки пользователя с ролями и permissions
   */
  private async loadUserWithRelations(
    where: Partial<User> | string,
  ): Promise<User | null> {
    try {
      const opts =
        typeof where === 'string' ? { where: { id: where } } : { where };
      return await this.usersRepo.findOne({
        ...opts,
        relations: {
          userRoles: {
            role: { rolePermissions: { permission: true } },
          },
        },
      });
    } catch (err) {
      this.logger.error(
        `[loadUserWithRelations] Ошибка загрузки пользователя: ${err.message}`,
        err.stack || err,
      );
      throw new RpcException({
        status: 500,
        message: err.message || 'Ошибка загрузки пользователя',
      });
    }
  }

  /**
   * Генерация JWT-токена на основе пользователя, ролей и permissions
   */
  private buildToken(user: User) {
    if (!user) {
      const msg = '[buildToken] Пользователь не найден для генерации токена';
      this.logger.error(msg);
      throw new RpcException({ status: 500, message: msg });
    }
    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );
    const payload = { sub: user.id, email: user.email, roles, permissions };
    this.logger.log(
      `[buildToken] Генерируем JWT для пользователя id=${user.id}`,
    );
    return this.jwt.sign(payload);
  }
}
