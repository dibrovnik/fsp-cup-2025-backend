// api-gateway/src/regions/regions.controller.ts

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
import { CreateRegionDto } from 'apps/users-service/src/regions/dto/create-region.dto';
import { RegionDto } from 'apps/users-service/src/regions/dto/region.dto';
import { UpdateRegionDto } from 'apps/users-service/src/regions/dto/update-region.dto';


@ApiTags('Regions')
@Controller('regions')
export class RegionsController implements OnModuleInit {
  private readonly logger = new Logger(RegionsController.name);

  constructor(@Inject('USERS_SERVICE') private readonly users: ClientProxy) {}

  onModuleInit() {
    this.logger.log('Connecting to core-service for regions…');
    this.users
      .connect()
      .then(() => this.logger.log('Connected to core-service'))
      .catch((err) =>
        this.logger.error('Error connecting to core-service', err),
      );
  }

  @Post('ping')
  async ping(@Body() ping: { ping: string }): Promise<string> {
    console.log('Creating region:', ping);
    return firstValueFrom(this.users.send<string>('regions-ping', ping));
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый регион' })
  @ApiBody({ type: CreateRegionDto })
  @ApiResponse({
    status: 201,
    description: 'Регион создан',
    type: RegionDto,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateRegionDto): Promise<RegionDto> {
    console.log('Creating region:', dto);
    try {
      return await firstValueFrom(
        this.users.send<RegionDto>('regions-create', dto),
      );
    } catch (err: any) {
      if (err?.error?.status && err?.error?.message) {
        throw new HttpException(err.error.message, err.error.status);
      }
      throw new HttpException('Bad gateway', HttpStatus.BAD_GATEWAY);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Получить список всех регионов' })
  @ApiResponse({
    status: 200,
    description: 'Массив регионов',
    type: [RegionDto],
  })
  async findAll(): Promise<RegionDto[]> {
    try {
      return await firstValueFrom(
        this.users.send<RegionDto[]>('regions.findAll', {}),
      );
    } catch {
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить регион по ID' })
  @ApiParam({ name: 'id', description: 'UUID региона' })
  @ApiResponse({
    status: 200,
    description: 'Регион найден',
    type: RegionDto,
  })
  @ApiResponse({ status: 404, description: 'Регион не найден' })
  async findOne(@Param('id') id: string): Promise<RegionDto> {
    try {
      return await firstValueFrom(
        this.users.send<RegionDto>('regions.findOne', id),
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
  @ApiOperation({ summary: 'Обновить регион по ID' })
  @ApiParam({ name: 'id', description: 'UUID региона' })
  @ApiBody({ type: UpdateRegionDto })
  @ApiResponse({
    status: 200,
    description: 'Регион обновлён',
    type: RegionDto,
  })
  @ApiResponse({ status: 404, description: 'Регион не найден' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRegionDto,
  ): Promise<RegionDto> {
    try {
      return await firstValueFrom(
        this.users.send<RegionDto>('regions.update', { id, dto }),
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
  @ApiOperation({ summary: 'Удалить регион по ID' })
  @ApiParam({ name: 'id', description: 'UUID региона' })
  @ApiResponse({ status: 200, description: 'Регион удалён' })
  @ApiResponse({ status: 404, description: 'Регион не найден' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await firstValueFrom(this.users.send<void>('regions.remove', id));
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
