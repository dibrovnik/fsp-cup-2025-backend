// api-gateway/src/competitions/competitions.controller.ts
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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { CreateCompetitionDto } from 'apps/core-service/src/competitions/dto/create-competition.dto';
import { CompetitionDto } from 'apps/core-service/src/competitions/dto/competition.dto';
import { UpdateCompetitionDto } from 'apps/core-service/src/competitions/dto/update-competition.dto';
import { FilterCompetitionsDto } from 'apps/core-service/src/competitions/dto/filter-competitions.dto';
import { TeamWithMembersDto } from './dto/team-with-members.dto';
import { TeamMemberDto } from 'apps/core-service/src/teams/dto/team-member.dto';



@ApiTags('Competitions')
@Controller('competitions')
export class CompetitionsController implements OnModuleInit {
  private readonly logger = new Logger(CompetitionsController.name);

  constructor(
    @Inject('CORE_SERVICE') private readonly coreClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.logger.log('Connecting to core-service…');
    this.coreClient
      .connect()
      .then(() => this.logger.log('Connected to core-service'))
      .catch((err) =>
        this.logger.error('Error connecting to core-service', err),
      );
  }

  private handleRpcError(err: any): never {
    if (
      err &&
      typeof err.status === 'number' &&
      typeof err.message === 'string'
    ) {
      throw new HttpException(err.message, err.status);
    }
    if (err instanceof RpcException) {
      const rpc = err.getError() as any;
      if (rpc?.status && rpc?.message) {
        throw new HttpException(rpc.message, rpc.status);
      }
    }
    if (err instanceof TimeoutError) {
      throw new HttpException('Gateway timeout', HttpStatus.GATEWAY_TIMEOUT);
    }
    this.logger.error('Unexpected RPC error', err.stack || err);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Создать новое соревнование' })
  @ApiBody({ type: CreateCompetitionDto })
  @ApiResponse({
    status: 201,
    description: 'Соревнование создано',
    type: CompetitionDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateCompetitionDto): Promise<CompetitionDto> {
    try {
      return await firstValueFrom(
        this.coreClient.send<CompetitionDto>('competitions.create', dto),
      );
    } catch (err: any) {
      if (err?.error?.status && err?.error?.message) {
        throw new HttpException(err.error.message, err.error.status);
      }
      throw new HttpException('Bad gateway', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех соревнований с фильтрацией' })
  @ApiQuery({ type: FilterCompetitionsDto, required: false })
  @ApiResponse({
    status: 200,
    description: 'Массив соревнований',
    type: [CompetitionDto],
  })
  async findAll(
    @Query() filter: FilterCompetitionsDto,
  ): Promise<CompetitionDto[]> {
    try {
      return await firstValueFrom(
        this.coreClient.send<CompetitionDto[]>('competitions.findAll', filter),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить соревнование по ID' })
  @ApiParam({ name: 'id', description: 'UUID соревнования' })
  @ApiResponse({
    status: 200,
    description: 'Соревнование найдено',
    type: CompetitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Не найдено соревнование с таким ID',
  })
  async findOne(@Param('id') id: string): Promise<CompetitionDto> {
    try {
      return await firstValueFrom(
        this.coreClient.send<CompetitionDto>('competitions.findOne', id),
      );
    } catch (err: any) {
      if (err?.error?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(err.error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить соревнование по ID' })
  @ApiParam({ name: 'id', description: 'UUID соревнования' })
  @ApiBody({ type: UpdateCompetitionDto })
  @ApiResponse({
    status: 200,
    description: 'Соревнование обновлено',
    type: CompetitionDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Соревнование не найдено',
  })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompetitionDto,
  ): Promise<CompetitionDto> {
    try {
      return await firstValueFrom(
        this.coreClient.send<CompetitionDto>('competitions.update', {
          id,
          dto,
        }),
      );
    } catch (err: any) {
      if (err?.error?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(err.error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить соревнование по ID' })
  @ApiParam({ name: 'id', description: 'UUID соревнования' })
  @ApiResponse({ status: 200, description: 'Соревнование удалено' })
  @ApiResponse({ status: 404, description: 'Соревнование не найдено' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await firstValueFrom(
        this.coreClient.send<void>('competitions.remove', id),
      );
    } catch (err: any) {
      if (err?.error?.status === HttpStatus.NOT_FOUND) {
        throw new HttpException(err.error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить всех участников соревнования.
   */
  @Get(':id/participants')
  @ApiOperation({ summary: 'Получить список всех участников соревнования' })
  @ApiParam({ name: 'id', description: 'UUID соревнования' })
  @ApiResponse({
    status: 200,
    description: 'Массив UUID пользователей, участвующих в соревновании',
    schema: {
      type: 'array',
      items: { type: 'string', format: 'uuid' },
    },
  })
  async getParticipants(@Param('id') id: string): Promise<string[]> {
    try {
      return await firstValueFrom(
        this.coreClient.send<string[]>('competitions.getParticipants', id),
      );
    } catch (err: any) {
      throw new HttpException(
        err?.message || 'Internal server error',
        err?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Получить все команды и их участников для соревнования.
   */
  @Get(':id/teams-with-members')
  @ApiOperation({ summary: 'Получить команды и их участников по соревнованию' })
  @ApiParam({ name: 'id', description: 'UUID соревнования' })
  @ApiResponse({
    status: 200,
    description: 'Массив объектов { teamId, members }',
    type: [TeamWithMembersDto],
  })
  async getTeamsWithMembers(
    @Param('id') id: string,
  ): Promise<Array<{ teamId: string; members: TeamMemberDto[] }>> {
    try {
      return await firstValueFrom(
        this.coreClient.send<
          Array<{ teamId: string; members: TeamMemberDto[] }>
        >('competitions.getTeamsWithMembers', id),
      );
    } catch (err: any) {
      throw new HttpException(
        err?.message || 'Internal server error',
        err?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
