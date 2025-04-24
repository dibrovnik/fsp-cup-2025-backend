// src/competitions/competitions.service.ts
import { Injectable, NotFoundException, Logger, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult, SelectQueryBuilder } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { ClientProxy } from '@nestjs/microservices';
import { RegionStub } from './entities/region-stub.entity';
import { firstValueFrom } from 'rxjs';
import { FilterCompetitionsDto } from './dto/filter-competitions.dto';
import { TeamMember } from '../teams/entities/team-member.entity';
import { Application } from '../applications/entities/application.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);

  constructor(
    @InjectRepository(Competition)
    private readonly compRepo: Repository<Competition>,

    @InjectRepository(Application)
    private readonly appRepo: Repository<Application>,

    @InjectRepository(TeamMember)
    private readonly memberRepo: Repository<TeamMember>,

    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  /**
   * Создаёт новое соревнование.
   */
  async create(dto: CreateCompetitionDto): Promise<Competition> {
    this.logger.log(`Создание соревнования: ${dto.name}`);
    const comp = this.compRepo.create(dto);
    const saved = await this.compRepo.save(comp);
    this.logger.log(`Соревнование создано с id: ${saved.id}`);
    return saved;
  }

  /**
   * Возвращает список всех соревнований.
   */
  // async findAll(): Promise<Competition[]> {
  //   this.logger.log('Получение списка всех соревнований');
  //   const list = await this.compRepo.find();
  //   this.logger.log(`Найдено соревнований: ${list.length}`);
  //   return list;
  // }

  async findAll(
    filter: FilterCompetitionsDto = {},
  ): Promise<Array<Competition & { region?: RegionStub }>> {
    this.logger.log(`findAll with filter ${JSON.stringify(filter)}`);
    let qb: SelectQueryBuilder<Competition> =
      this.compRepo.createQueryBuilder('c');

    if (filter.type) {
      qb = qb.andWhere('c.type = :type', { type: filter.type });
    }
    if (filter.discipline) {
      qb = qb.andWhere('c.discipline = :discipline', {
        discipline: filter.discipline,
      });
    }
    if (filter.regionId !== undefined) {
      qb = qb.andWhere('c.regionId = :regionId', { regionId: filter.regionId });
    }
    if (filter.dateFrom) {
      qb = qb.andWhere('c.startDate >= :dateFrom', {
        dateFrom: filter.dateFrom,
      });
    }
    if (filter.dateTo) {
      qb = qb.andWhere('c.endDate <= :dateTo', { dateTo: filter.dateTo });
    }

    const comps = await qb.getMany();
    return Promise.all(
      comps.map(async (comp) => {
        if (comp.regionId != null) {
          try {
            const region = await firstValueFrom(
              this.usersClient.send<RegionStub>(
                'regions.findOne',
                comp.regionId,
              ),
            );
            return { ...comp, region };
          } catch {
            this.logger.warn(`Region ${comp.regionId} not found`);
          }
        }
        return comp;
      }),
    );
  }

  /**
   * Возвращает одно соревнование по его UUID.
   * @throws NotFoundException если не найдено
   */
  async findOne(id: string): Promise<Competition & { region?: RegionStub }> {
    this.logger.log(`Поиск соревнования по id: ${id}`);
    let comp: Competition;
    try {
      comp = await this.compRepo.findOneOrFail({ where: { id } });
      this.logger.log(`Соревнование найдено: ${id}`);
    } catch {
      this.logger.warn(`Соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }

    if (comp.regionId != null) {
      try {
        const region = await firstValueFrom(
          this.usersClient.send<RegionStub>('regions.findOne', comp.regionId),
        );
        return { ...comp, region };
      } catch {
        this.logger.warn(`Region ${comp.regionId} not found`);
      }
    }

    return comp;
  }

  /**
   * Обновляет существующее соревнование.
   */
  async update(id: string, dto: UpdateCompetitionDto): Promise<Competition> {
    this.logger.log(
      `Обновление соревнования ${id} данными: ${JSON.stringify(dto)}`,
    );
    const result: UpdateResult = await this.compRepo.update(id, dto);
    if (result.affected === 0) {
      this.logger.warn(`Не удалось обновить, соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }
    const updated = await this.compRepo.findOneOrFail({ where: { id } });
    this.logger.log(`Соревнование обновлено: ${id}`);
    return updated;
  }

  /**
   * Удаляет соревнование по его UUID.
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Удаление соревнования: ${id}`);
    const result: DeleteResult = await this.compRepo.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Не удалось удалить, соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }
    this.logger.log(`Соревнование удалено: ${id}`);
  }

  /**
   * Возвращает массив объектов пользователей:
   * как тех, кто подал личную заявку, так и всех членов команд.
   */
  async getParticipants(competitionId: string): Promise<any[]> {
    // 1) Проверяем, что соревнование существует
    await this.findOne(competitionId);

    // 2) Берём все заявки на это соревнование вместе с командами
    const apps = await this.appRepo.find({
      where: { competition: { id: competitionId } },
      relations: ['team'],
    });

    // 3) Собираем одиночные userId
    const soloIds = apps.filter((a) => !!a.userId).map((a) => a.userId!);

    // 4) Командные заявки — вытаскиваем их team.id
    const teamIds = Array.from(
      new Set(apps.filter((a) => a.team).map((a) => a.team!.id)),
    );

    // 5) По каждой команде получаем её участников
    const memberIds = (
      await Promise.all(
        teamIds.map((tid) =>
          this.memberRepo.find({ where: { team: { id: tid } } }),
        ),
      )
    )
      .flat()
      .map((m) => m.userId);

    // 6) Собираем все уникальные ID
    const allIds = Array.from(new Set([...soloIds, ...memberIds]));

    // 7) Подгружаем объекты пользователей из USERS_SERVICE
    const users = await Promise.all(
      allIds.map(async (userId) => {
        try {
          return await firstValueFrom(
            this.usersClient.send<any>('get-user', userId),
          );
        } catch (err) {
          this.logger.warn(`Не удалось загрузить пользователя ${userId}`);
          // можно вернуть null, а потом отфильтровать
          return null;
        }
      }),
    );

    // 8) Убираем не найденных
    return users.filter((u) => u !== null);
  }

  /**
   * Возвращает массив { teamId, members }
   * для всех команд, подавших заявку на конкурс.
   */
  async getTeamsWithMembers(
    competitionId: string,
  ): Promise<Array<{ team: Team; members: TeamMember[] }>> {
    // Убедимся, что соревнование существует
    await this.findOne(competitionId);

    // Получим все заявки с их командами
    const apps = await this.appRepo.find({
      where: { competition: { id: competitionId } },
      relations: ['team'],
    });

    // Соберём уникальные команды
    const teamsMap = new Map<string, Team>();
    for (const app of apps) {
      if (app.team) {
        teamsMap.set(app.team.id, app.team);
      }
    }

    // Для каждой команды загрузим её участников
    return Promise.all(
      Array.from(teamsMap.values()).map(async (team) => {
        const members = await this.memberRepo.find({
          where: { team: { id: team.id } },
          // relations: ['user'] // если вам нужна инфа о пользователях
        });
        return { team, members };
      }),
    );
  }
}
