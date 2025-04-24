// src/competitions/competitions.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { CompetitionsService } from './competitions.service';
import { CreateCompetitionDto } from './dto/create-competition.dto';
import { UpdateCompetitionDto } from './dto/update-competition.dto';
import { Competition } from './entities/competition.entity';
import { FilterCompetitionsDto } from './dto/filter-competitions.dto';

@Controller() // RPC-контроллер микросервиса competitions
export class CompetitionsController {
  constructor(private readonly service: CompetitionsService) {}

  /**
   * Создать соревнование.
   * @param dto Данные нового соревнования.
   * @returns Созданный объект Competition.
   */
  @MessagePattern('competitions.create')
  async create(@Payload() dto: CreateCompetitionDto): Promise<Competition> {
    return this.service.create(dto);
  }

  @MessagePattern('competitions.findAll')
  async findAll(
    @Payload() filter: FilterCompetitionsDto,
  ): Promise<Array<Competition & { region?: any }>> {
    try {
      return await this.service.findAll(filter);
    } catch (err) {
      throw new RpcException({
        status: err.status || 500,
        message: err.message || 'Error fetching competitions',
      });
    }
  }

  /**
   * Получить одно соревнование по ID.
   * @param id UUID соревнования.
   * @returns Объект Competition.
   */
  @MessagePattern('competitions.findOne')
  async findOne(@Payload() id: string): Promise<Competition> {
    return this.service.findOne(id);
  }

  /**
   * Обновить соревнование по ID.
   * @param data Объект { id, dto }, где dto — поля для обновления.
   * @returns Обновлённый объект Competition.
   */
  @MessagePattern('competitions.update')
  async update(
    @Payload() data: { id: string; dto: UpdateCompetitionDto },
  ): Promise<Competition> {
    const { id, dto } = data;
    return this.service.update(id, dto);
  }

  /**
   * Удалить соревнование по ID.
   * @param id UUID соревнования для удаления.
   */
  @MessagePattern('competitions.remove')
  async remove(@Payload() id: string): Promise<void> {
    return this.service.remove(id);
  }
}
