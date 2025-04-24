// src/applications/applications.controller.ts

import { Controller, BadRequestException, Logger } from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';


@Controller()
export class ApplicationsController {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(private svc: ApplicationsService) {}

  private wrap(fn: () => Promise<any>) {
    return fn().catch((err) => {
      this.logger.error(err.message, err.stack);
      if (err.status && err.message) {
        throw new RpcException({ status: err.status, message: err.message });
      }
      throw new RpcException({ status: 500, message: 'Internal error' });
    });
  }

  @MessagePattern('applications.create')
  create(@Payload() dto: CreateApplicationDto) {
    return this.wrap(() => this.svc.create(dto));
  }

  @MessagePattern('applications.findAll')
  findAll() {
    return this.wrap(() => this.svc.findAll());
  }

  @MessagePattern('applications.findOne')
  findOne(@Payload() id: string) {
    return this.wrap(() => this.svc.findOne(id));
  }

  @MessagePattern('applications.findByCompetition')
  findByCompetition(@Payload() competitionId: string) {
    return this.wrap(() => this.svc.findByCompetition(competitionId));
  }

  @MessagePattern('applications.findByRegion')
  findByRegion(@Payload() regionId: number) {
    return this.wrap(() => this.svc.findByRegion(regionId));
  }

  @MessagePattern('applications.findByUser')
  findByUser(@Payload() userId: string) {
    return this.wrap(() => this.svc.findByUser(userId));
  }

  @MessagePattern('applications.update')
  update(@Payload() dto: UpdateApplicationDto) {
    return this.wrap(() => this.svc.update(dto));
  }
}
