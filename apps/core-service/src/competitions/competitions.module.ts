// src/competitions/competitions.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompetitionsService } from './competitions.service';
import { CompetitionsController } from './competitions.controller';
import { Competition } from './entities/competition.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Application } from '../applications/entities/application.entity';
import { Team } from '../teams/entities/team.entity';
import { TeamMember } from '../teams/entities/team-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Competition,
      Application, // для доступа к заявкам
      Team, // для проверки существования команды
      TeamMember, // для доступа к участникам команды
    ]),
    ClientsModule.registerAsync([
      {
        name: 'USERS_SERVICE',
        imports: [ConfigModule],
        useFactory: (cfg: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: cfg.get('USERS_SERVICE_HOST'),
            port: cfg.get<number>('USERS_SERVICE_PORT'),
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [CompetitionsService],
  controllers: [CompetitionsController],
  exports: [CompetitionsService],
})
export class CompetitionsModule {}
