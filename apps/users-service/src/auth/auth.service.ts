import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
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

  /* ----------------- РЕГИСТРАЦИЯ ----------------- */
  async register(dto: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    regionId?: number;
  }) {
    this.logger.log(`Register attempt: email=${dto.email}`);
    try {
      const hash = await bcrypt.hash(dto.password, 10);
      this.logger.debug(`Password hashed for email=${dto.email}`);

      // 1) создаём пользователя
      const user = this.usersRepo.create({
        email: dto.email,
        password_hash: hash,
        first_name: dto.first_name,
        last_name: dto.last_name,
      });
      await this.usersRepo.save(user);
      this.logger.log(`User created: id=${user.id}, email=${user.email}`);

      // 2) выдаём дефолт‑роль athlete
      const athlete = await this.rolesRepo.findOne({
        where: { name: 'athlete' },
      });
      if (!athlete) {
        const msg = 'Role "athlete" not found (seed migration missing)';
        this.logger.error(msg);
        throw new RpcException({ status: 'error', message: msg });
      }
      const link = this.userRoleRepo.create({ user, role: athlete });
      await this.userRoleRepo.save(link);

      const loadedUser = await this.loadUserWithRelations(user.id);
      if (!loadedUser) {
        const msg = `User not found after save: id=${user.id}`;
        this.logger.error(msg);
        throw new NotFoundException(msg);
      }
      this.logger.log(`User loaded with relations: id=${loadedUser.id}`);


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


      return { userDto, access_token: token };
    } catch (err) {
      this.logger.error(
        `Registration failed for email=${dto.email}`,
        err.stack || err.message,
      );
      throw new RpcException({
        status: 'error',
        message: err.message || 'Register failed',
      });
    }
  }

  /* ----------------- ЛОГИН ----------------- */
  async login(dto: { email: string; password: string }) {
    this.logger.log(`Login attempt: email=${dto.email}`);
    try {
      const user = await this.loadUserWithRelations({ email: dto.email });
      if (!user) {
        this.logger.warn(`Login failed: user not found for email=${dto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      const passwordValid = await bcrypt.compare(
        dto.password,
        user.password_hash,
      );
      if (!passwordValid) {
        this.logger.warn(
          `Login failed: invalid password for email=${dto.email}`,
        );
        throw new UnauthorizedException('Invalid credentials');
      }

      this.logger.log(`User authenticated: id=${user.id}, email=${user.email}`);
      
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
      return {user: userDto, access_token: token};

    } catch (err) {
      this.logger.error(
        `Login error for email=${dto.email}`,
        err.stack || err.message,
      );
      throw new RpcException({
        status: 'error',
        message: err.message || 'Login failed',
      });
    }
  }

  /* ----------------- ВСПОМОГАТЕЛЬНЫЕ ----------------- */
  private async loadUserWithRelations(
    where: Partial<User> | string,
  ): Promise<User | null> {
    const opts =
      typeof where === 'string' ? { where: { id: where } } : { where };
    return this.usersRepo.findOne({
      ...opts,
      relations: {
        userRoles: {
          role: { rolePermissions: { permission: true } },
        },
      },
    });
  }

  private buildToken(user: User) {
    if (!user) {
      const msg = 'User not found for token generation';
      this.logger.error(msg);
      throw new RpcException({ status: 'error', message: msg });
    }

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );
    const payload = { sub: user.id, email: user.email, roles, permissions };
    this.logger.log(`Building JWT for user id=${user.id}`);
    return this.jwt.sign(payload);
  }
}
