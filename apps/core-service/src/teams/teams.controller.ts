// src/teams/teams.controller.ts

import {
  Controller,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { TeamsService } from './teams.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InviteByCodeDto } from './dto/invite-by-code.dto';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { JoinByLinkDto } from './dto/join-by-link.dto';
import { ConfirmMemberDto } from './dto/confirm-member.dto';

@Controller()
export class TeamsController {
  private readonly logger = new Logger(TeamsController.name);

  constructor(private readonly svc: TeamsService) {}

  private handleError(err: any): never {
    this.logger.error(err.message, err.stack);
    if (err instanceof NotFoundException) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: err.message,
      });
    }
    // можно добавить другие instance checks: BadRequestException и т.п.
    throw new RpcException({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: err.message || 'Internal error',
    });
  }

  @MessagePattern('teams.ping')
  ping(@Payload() data: { ping: string }) {
    this.logger.debug(`ping received: ${JSON.stringify(data)}`);
    return 'pong';
  }

  @MessagePattern('teams.create')
  async create(@Payload() dto: CreateTeamDto) {
    try {
      return await this.svc.create(dto);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.findAll')
  async findAll() {
    try {
      return await this.svc.findAll();
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.findOne')
  async findOne(@Payload() id: string) {
    try {
      return await this.svc.findOne(id);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.update')
  async update(@Payload() data: { id: string; dto: UpdateTeamDto }) {
    try {
      return await this.svc.update(data.id, data.dto);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.remove')
  async remove(@Payload() id: string) {
    try {
      return await this.svc.remove(id);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.inviteByCode')
  async inviteByCode(@Payload() dto: InviteByCodeDto) {
    try {
      return await this.svc.inviteByCode(dto.code, dto.userId);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.createInvitation')
  async createInvitation(@Payload() dto: CreateInvitationDto) {
    try {
      return await this.svc.createInvitation(
        dto.teamId,
        dto.createdBy,
        dto.usesLeft,
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.joinByLink')
  async joinByLink(@Payload() dto: JoinByLinkDto) {
    try {
      return await this.svc.joinByLink(dto.token, dto.userId);
    } catch (err) {
      this.handleError(err);
    }
  }

  @MessagePattern('teams.confirmMember')
  async confirmMember(@Payload() dto: ConfirmMemberDto) {
    try {
      return await this.svc.confirmMember(dto.teamId, dto.userId, dto.accept);
    } catch (err) {
      this.handleError(err);
    }
  }
}
