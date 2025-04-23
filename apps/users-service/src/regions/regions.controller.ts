// src/regions/regions.controller.ts
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegionsService } from './regions.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { Region } from './entities/region.entity';

@Controller()
export class RegionsController {
  constructor(private readonly svc: RegionsService) {}

  @MessagePattern('regions-create')
  async create(@Payload() dto: CreateRegionDto): Promise<Region> {
    console.log('Creating region:', dto);
    return this.svc.create(dto);
  }

  @MessagePattern('regions.findAll')
  async findAll(): Promise<Region[]> {
    return this.svc.findAll();
  }

  @MessagePattern('regions.findOne')
  async findOne(@Payload() id: number): Promise<Region> {
    return this.svc.findOne(id);
  }

  @MessagePattern('regions.update')
  async update(
    @Payload() data: { id: number; dto: UpdateRegionDto },
  ): Promise<Region> {
    return this.svc.update(data.id, data.dto);
  }

  @MessagePattern('regions.remove')
  async remove(@Payload() id: number): Promise<void> {
    return this.svc.remove(id);
  }
}
