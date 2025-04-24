// api-gateway/src/teams/teams.controller.ts

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  OnModuleInit,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { CreateTeamDto } from 'apps/core-service/src/teams/dto/create-team.dto';
import { TeamDto } from 'apps/core-service/src/teams/dto/team.dto';
import { UpdateTeamDto } from 'apps/core-service/src/teams/dto/update-team.dto';
import { InviteByCodeDto } from 'apps/core-service/src/teams/dto/invite-by-code.dto';
import { TeamMemberDto } from 'apps/core-service/src/teams/dto/team-member.dto';
import { CreateInvitationDto } from 'apps/core-service/src/teams/dto/create-invitation.dto';
import { InvitationDto } from 'apps/core-service/src/teams/dto/invitation.dto';
import { JoinByLinkDto } from 'apps/core-service/src/teams/dto/join-by-link.dto';
import { ConfirmMemberDto } from 'apps/core-service/src/teams/dto/confirm-member.dto';


@ApiTags('Teams')
@Controller('teams')
export class TeamsController implements OnModuleInit {
  private readonly logger = new Logger(TeamsController.name);

  constructor(@Inject('CORE_SERVICE') private readonly core: ClientProxy) {}

  onModuleInit() {
    this.logger.log('Connecting to core-service (teams)…');
    this.core
      .connect()
      .then(() => this.logger.log('Connected'))
      .catch((err) => this.logger.error('Connection error', err));
  }

  private handleRpcError(err: any): never {
    // 1) Если это уже «сырая» ошибка вида { status: number, message: string }
    if (
      err &&
      typeof err.status === 'number' &&
      typeof err.message === 'string'
    ) {
      throw new HttpException(err.message, err.status);
    }

    // 2) Если это RpcException
    if (err instanceof RpcException) {
      const rpcError = err.getError() as any;
      if (rpcError?.status && rpcError?.message) {
        throw new HttpException(rpcError.message, rpcError.status);
      }
    }

    // 3) Timeout
    if (err instanceof TimeoutError) {
      throw new HttpException('Gateway timeout', HttpStatus.GATEWAY_TIMEOUT);
    }

    // 4) Всё остальное
    this.logger.error('Unexpected error', err.stack || err);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new team' })
  @ApiBody({ type: CreateTeamDto })
  @ApiResponse({ status: 201, type: TeamDto })
  async create(@Body() dto: CreateTeamDto): Promise<TeamDto> {
    try {
      return await firstValueFrom(this.core.send<TeamDto>('teams.create', dto));
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all teams' })
  @ApiResponse({ status: 200, type: [TeamDto] })
  async findAll(): Promise<TeamDto[]> {
    try {
      return await firstValueFrom(
        this.core.send<TeamDto[]>('teams.findAll', {}),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  /**
   * GET /teams/user/:userId
   */
  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all teams for a given user' })
  @ApiParam({ name: 'userId', description: 'UUID of the user' })
  @ApiResponse({
    status: 200,
    description: 'Array of teams the user belongs to',
    type: [TeamDto],
  })
  @ApiResponse({ status: 404, description: 'No teams found for this user' })
  async findByUser(@Param('userId') userId: string): Promise<TeamDto[]> {
    try {
      return await firstValueFrom(
        this.core.send<TeamDto[]>('teams.findByUser', userId),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a team by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200, type: TeamDto })
  @ApiResponse({ status: 404 })
  async findOne(@Param('id') id: string): Promise<TeamDto> {
    try {
      return await firstValueFrom(this.core.send<TeamDto>('teams.findOne', id));
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a team by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiBody({ type: UpdateTeamDto })
  @ApiResponse({ status: 200, type: TeamDto })
  @ApiResponse({ status: 404 })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamDto,
  ): Promise<TeamDto> {
    try {
      return await firstValueFrom(
        this.core.send<TeamDto>('teams.update', { id, dto }),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a team by ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      return await firstValueFrom(this.core.send<void>('teams.remove', id));
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Post('invite/code')
  @ApiOperation({ summary: 'Join a team by invite code' })
  @ApiBody({ type: InviteByCodeDto })
  @ApiResponse({ status: 201, type: TeamMemberDto })
  async inviteByCode(@Body() dto: InviteByCodeDto): Promise<TeamMemberDto> {
    try {
      return await firstValueFrom(
        this.core.send<TeamMemberDto>('teams.inviteByCode', dto),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Post('invite')
  @ApiOperation({ summary: 'Create an invitation link' })
  @ApiBody({ type: CreateInvitationDto })
  @ApiResponse({ status: 201, type: InvitationDto })
  async createInvitation(
    @Body() dto: CreateInvitationDto,
  ): Promise<InvitationDto> {
    try {
      return await firstValueFrom(
        this.core.send<InvitationDto>('teams.createInvitation', dto),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Post('join/link')
  @ApiOperation({ summary: 'Join a team by invitation link' })
  @ApiBody({ type: JoinByLinkDto })
  @ApiResponse({ status: 201, type: TeamMemberDto })
  async joinByLink(@Body() dto: JoinByLinkDto): Promise<TeamMemberDto> {
    try {
      return await firstValueFrom(
        this.core.send<TeamMemberDto>('teams.joinByLink', dto),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Post(':teamId/members/:userId/confirm')
  @ApiOperation({ summary: 'Confirm or reject a pending member' })
  @ApiParam({ name: 'teamId', example: 'uuid' })
  @ApiParam({ name: 'userId', example: 'uuid' })
  @ApiBody({ schema: { properties: { accept: { type: 'boolean' } } } })
  @ApiResponse({ status: 200, type: TeamMemberDto })
  @ApiResponse({ status: 404 })
  async confirmMember(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() body: { accept: boolean },
  ): Promise<TeamMemberDto> {
    try {
      return await firstValueFrom(
        this.core.send<TeamMemberDto>('teams.confirmMember', {
          teamId,
          userId,
          accept: body.accept,
        }),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }
}