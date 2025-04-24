// src/config/typeorm.config.ts
import { DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { Competition } from '../competitions/entities/competition.entity';
import { Invitation } from '../teams/entities/invitation.entity';
import { TeamMember } from '../teams/entities/team-member.entity';
import { Team } from '../teams/entities/team.entity';
import { Application } from '../applications/entities/application.entity';
config(); // .env подключается здесь


export const typeOrmConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  entities: [Competition, Team, TeamMember, Invitation, Application],
  // entities: [join(__dirname, '/../**/*.entity.{ts,js}')],
  synchronize: true,
  migrations: ['src/migrations/*.ts'],
};
