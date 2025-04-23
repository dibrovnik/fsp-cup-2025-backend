// src/regions/regions.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { Region } from './entities/region.entity';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  constructor(
    @InjectRepository(Region)
    private readonly repo: Repository<Region>,
  ) {}

  /** Создание нового региона */
  async create(dto: CreateRegionDto): Promise<Region> {
    console.log('Создание региона:', dto);
    this.logger.log(`Создаём регион: code=${dto.code}, name=${dto.name}`);
    const region = this.repo.create(dto);
    return this.repo.save(region);
  }

  /** Список всех регионов */
  async findAll(): Promise<Region[]> {
    this.logger.log(`Запрос всех регионов`);
    return this.repo.find();
  }

  /** Найти регион по ID */
  async findOne(id: number): Promise<Region> {
    this.logger.log(`Поиск региона по id=${id}`);
    const region = await this.repo.findOneBy({ id });
    if (!region) {
      this.logger.warn(`Регион не найден: id=${id}`);
      throw new NotFoundException(`Region ${id} not found`);
    }
    return region;
  }

  /** Обновить регион */
  async update(id: number, dto: UpdateRegionDto): Promise<Region> {
    this.logger.log(`Обновление региона ${id}: ${JSON.stringify(dto)}`);
    const result: UpdateResult = await this.repo.update(id, dto);
    if (result.affected === 0) {
      this.logger.warn(`Не найден регион для обновления: id=${id}`);
      throw new NotFoundException(`Region ${id} not found`);
    }
    return this.findOne(id);
  }

  /** Удалить регион */
  async remove(id: number): Promise<void> {
    this.logger.log(`Удаление региона id=${id}`);
    const result: DeleteResult = await this.repo.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`Не найден регион для удаления: id=${id}`);
      throw new NotFoundException(`Region ${id} not found`);
    }
    this.logger.log(`Регион удалён: id=${id}`);
  }
}
