// src/competitions/competitions.service.ts
import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Competition } from './entities/competition.entity';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';

@Injectable()
export class CompetitionsService {
  private readonly logger = new Logger(CompetitionsService.name);

  constructor(
    @InjectRepository(Competition)
    private readonly repo: Repository<Competition>,
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
  async findAll(): Promise<Competition[]> {
    this.logger.log('Получение списка всех соревнований');
    const list = await this.repo.find();
    this.logger.log(`Найдено соревнований: ${list.length}`);
    return list;
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
