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

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);

  constructor(
    @InjectRepository(Competition)
    private readonly repo: Repository<Competition>,

    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {}

  /**
   * Создаёт новое соревнование.
   */
  async create(dto: CreateCompetitionDto): Promise<Competition> {
    this.logger.log(`Создание соревнования: ${dto.name}`);
    const comp = this.repo.create(dto);
    const saved = await this.repo.save(comp);
    this.logger.log(`Соревнование создано с id: ${saved.id}`);
    return saved;
  }

  /**
   * Возвращает список всех соревнований.
   */
  // async findAll(): Promise<Competition[]> {
  //   this.logger.log('Получение списка всех соревнований');
  //   const list = await this.repo.find();
  //   this.logger.log(`Найдено соревнований: ${list.length}`);
  //   return list;
  // }

  async findAll(
    filter: FilterCompetitionsDto = {},
  ): Promise<Array<Competition & { region?: RegionStub }>> {
    this.logger.log(`findAll with filter ${JSON.stringify(filter)}`);
    let qb: SelectQueryBuilder<Competition> = this.repo.createQueryBuilder('c');

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
        if (!comp.regionId) return comp;
        let region: RegionStub | undefined;
        try {
          region = await firstValueFrom(
            this.usersClient.send<RegionStub>('regions.findOne', comp.regionId),
          );
        } catch {
          this.logger.warn(`Region ${comp.regionId} not found`);
        }
        return { ...comp, region };
      }),
    );
  }

  /**
   * Возвращает одно соревнование по его UUID.
   * @throws NotFoundException если не найдено
   */
  async findOne(id: string): Promise<Competition> {
    this.logger.log(`Поиск соревнования по id: ${id}`);
    try {
      const comp = await this.repo.findOneOrFail({ where: { id } });
      this.logger.log(`Соревнование найдено: ${id}`);
      return comp;
    } catch {
      this.logger.warn(`Соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }
  }

  /**
   * Обновляет существующее соревнование.
   */
  async update(id: string, dto: UpdateCompetitionDto): Promise<Competition> {
    this.logger.log(
      `Обновление соревнования ${id} данными: ${JSON.stringify(dto)}`,
    );
    const result: UpdateResult = await this.repo.update(id, dto);
    if (result.affected === 0) {
      this.logger.warn(`Не удалось обновить, соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }
    const updated = await this.repo.findOneOrFail({ where: { id } });
    this.logger.log(`Соревнование обновлено: ${id}`);
    return updated;
  }

  /**
   * Удаляет соревнование по его UUID.
   */
  async remove(id: string): Promise<void> {
    this.logger.log(`Удаление соревнования: ${id}`);
    const result: DeleteResult = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Не удалось удалить, соревнование не найдено: ${id}`);
      throw new NotFoundException(`Competition with id "${id}" not found`);
    }
    this.logger.log(`Соревнование удалено: ${id}`);
  }
}
