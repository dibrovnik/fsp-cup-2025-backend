// src/applications/applications.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  /** Подать заявку с авто-approve для open/regional, иначе pending */
  async create(dto: CreateApplicationDto): Promise<Application> {
    const comp = await this.competitions.findOne(dto.competitionId);
    // comp бросит NotFound
    const app = this.repo.create({ competition: comp });

    if (dto.teamId) {
      const team = await this.teams.findOne(dto.teamId);
      app.team = team;
    } else if (dto.userId) {
      app.userId = dto.userId;
    } else {
      throw new BadRequestException('teamId or userId required');
    }

    // авто-approve
    if (comp.type === 'open' || comp.type === 'regional') {
      app.status = ApplicationStatus.APPROVED;
    } else {
      app.status = ApplicationStatus.PENDING;
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

  /** По соревнованию */
  async findByCompetition(compId: string): Promise<Application[]> {
    return this.repo.find({
      where: { competition: { id: compId } } as any,
      relations: ['competition', 'team'],
    });
  }

  /** По региону (через competition.regionId) */
  async findByRegion(regionId: number): Promise<Application[]> {
    return this.repo
      .createQueryBuilder('app')
      .innerJoinAndSelect('app.competition', 'comp')
      .leftJoinAndSelect('app.team', 'team')
      .where('comp.regionId = :regionId', { regionId })
      .getMany();
  }

  /** По пользователю (инд / команда) */
  async findByUser(userId: string): Promise<Application[]> {
    const teams = await this.teams.findByUser(userId);
    const teamIds = teams.map((t) => t.id);
    return this.repo.find({
      where: [{ userId } as any, { team: In(teamIds) } as any],
      relations: ['competition', 'team'],
    });
  }

  /** Обновить статус */
  async update(dto: UpdateApplicationDto): Promise<Application> {
    const app = await this.findOne(dto.id);
    app.status = dto.status;
    app.comment = dto.comment;
    return this.repo.save(app);
  }
}
