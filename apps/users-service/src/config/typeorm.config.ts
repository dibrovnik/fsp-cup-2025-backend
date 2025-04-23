// src/config/typeorm.config.ts
import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/entities/role.entity';
import { Permission } from '../auth/entities/permission.entity';
import { UserRole } from '../auth/entities/user-role.entity';
import { RolePermission } from '../auth/entities/role-permission.entity';
import { Region } from '../auth/entities/region.entity';
config(); // .env подключается здесь


export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [User, Role, Permission, UserRole, RolePermission, Region],
  // entities: [join(__dirname, '/../**/*.entity.{ts,js}')],
  synchronize: true,
  migrations: ['src/migrations/*.ts'],
};
