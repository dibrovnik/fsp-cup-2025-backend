// src/config/typeorm.config.ts
import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
config(); // .env подключается здесь


export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // entities: [User, Role, Permission, UserRole, RolePermission, Region],
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
  migrations: ['src/migrations/*.ts'],
};
