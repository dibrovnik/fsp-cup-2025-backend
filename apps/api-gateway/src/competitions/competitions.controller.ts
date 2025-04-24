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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { CreateCompetitionDto } from 'apps/core-service/src/competitions/dto/create-competition.dto';
import { CompetitionDto } from 'apps/core-service/src/competitions/dto/competition.dto';
import { UpdateCompetitionDto } from 'apps/core-service/src/competitions/dto/update-competition.dto';



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
  @ApiOperation({ summary: 'Получить список всех соревнований' })
  @ApiResponse({
    status: 200,
    description: 'Массив соревнований',
    type: [CompetitionDto],
  })
  async findAll(): Promise<CompetitionDto[]> {
    try {
      return await firstValueFrom(
        this.coreClient.send<CompetitionDto[]>('competitions.findAll', {}),
      );
    } catch {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
}
