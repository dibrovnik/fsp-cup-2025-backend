// src/applications/applications.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application, ApplicationStatus } from './entities/application.entity';

import { CompetitionsService } from '../competitions/competitions.service';
import { TeamsService } from '../teams/teams.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private repo: Repository<Application>,
    private competitions: CompetitionsService,
    private teams: TeamsService,
  ) {}

  /** Подать заявку */
  async create(dto: CreateApplicationDto): Promise<Application> {
    const comp = await this.competitions.findOne(dto.competitionId);
    if (!comp) throw new NotFoundException('Competition not found');

    // Проверка региона: если сопоставимо
    if (comp.type === 'regional') {
      // TODO: получить регион пользователя/команды и сверить comp.regionId
    }

    const app = this.repo.create({ competition: comp });
    if (dto.teamId) {
      const team = await this.teams.findOne(dto.teamId);
      if (!team) throw new NotFoundException('Team not found');
      app.team = team;
    } else if (dto.userId) {
      app.userId = dto.userId;
    } else {
      throw new BadRequestException('Either teamId or userId required');
    }
    return this.repo.save(app);
  }

  /** Все заявки */
  findAll(): Promise<Application[]> {
    return this.repo.find({ relations: ['competition', 'team'] });
  }

  /** Заявка по ID */
  async findOne(id: string): Promise<Application> {
    const a = await this.repo.findOne({
      where: { id },
      relations: ['competition', 'team'],
    });
    if (!a) throw new NotFoundException('Application not found');
    return a;
  }

  /** Обновить статус */
  async update(dto: UpdateApplicationDto): Promise<Application> {
    const app = await this.findOne(dto.id);
    app.status = dto.status;
    app.comment = dto.comment;
    return this.repo.save(app);
  }
}
