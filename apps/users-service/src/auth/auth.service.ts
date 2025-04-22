// apps/users-service/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';


import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { UserRole } from './entities/user-role.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Role) private rolesRepo: Repository<Role>,
    @InjectRepository(Permission) private permsRepo: Repository<Permission>,
    @InjectRepository(UserRole) private userRoleRepo: Repository<UserRole>,
    private jwt: JwtService,
  ) {}

  /* ----------------- РЕГИСТРАЦИЯ ----------------- */
  async register(dto) {
    const hash = await bcrypt.hash(dto.password, 10);

    // 1) создаём пользователя
    const user = this.usersRepo.create({
      email: dto.email,
      password_hash: hash,
      first_name: dto.first_name,
      last_name: dto.last_name,
      region: { id: dto.regionId },
    });
    await this.usersRepo.save(user);

    // 2) выдаём дефолт‑роль athlete
    const athlete = await this.rolesRepo.findOne({
      where: { name: 'athlete' },
    });
    if (!athlete)
      throw new Error('Роль athlete не найдена (seed‑миграция пропущена)');

    const link = this.userRoleRepo.create({ user, role: athlete });
    await this.userRoleRepo.save(link);

    const loadedUser = await this.loadUserWithRelations(user.id);
    if (!loadedUser) throw new NotFoundException('Пользователь не найден');
    return this.buildToken(loadedUser);
  }

  /* ----------------- ЛОГИН ----------------- */
  async login(dto) {
    const user = await this.loadUserWithRelations({ email: dto.email });
    if (!user || !(await bcrypt.compare(dto.password, user.password_hash)))
      throw new UnauthorizedException('Неверный логин/пароль');

    return this.buildToken(user);
  }

  /* ----------------- ВСПОМОГАТЕЛЬНЫЕ ----------------- */
  private async loadUserWithRelations(where: Partial<User> | string) {
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
    if (!user) throw new NotFoundException('Пользователь не найден');

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );

    const payload = { sub: user.id, email: user.email, roles, permissions };
    return { access_token: this.jwt.sign(payload) };
  }
}
