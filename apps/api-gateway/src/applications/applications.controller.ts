// api-gateway/src/applications/applications.controller.ts

import {
  Controller,
  Post,
  Get,
  Patch,
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
import { CreateApplicationDto } from 'apps/core-service/src/applications/dto/create-application.dto';
import { ApplicationDto } from 'apps/core-service/src/applications/dto/application.dto';
import { UpdateApplicationDto } from 'apps/core-service/src/applications/dto/update-application.dto';



@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController implements OnModuleInit {
  private readonly logger = new Logger(ApplicationsController.name);

  constructor(@Inject('CORE_SERVICE') private readonly core: ClientProxy) {}

  onModuleInit() {
    this.core
      .connect()
      .then(() => this.logger.log('Connected to core-service (applications)'))
      .catch((err) => this.logger.error('Connection error', err));
  }

  private handleRpcError(err: any): never {
    // 1) «сырой» объект {status, message}
    if (
      err &&
      typeof err.status === 'number' &&
      typeof err.message === 'string'
    ) {
      throw new HttpException(err.message, err.status);
    }
    // 2) RpcException
    if (err instanceof RpcException) {
      const rpc = err.getError() as any;
      if (rpc?.status && rpc?.message) {
        throw new HttpException(rpc.message, rpc.status);
      }
    }
    // 3) Timeout
    if (err instanceof TimeoutError) {
      throw new HttpException('Gateway timeout', HttpStatus.GATEWAY_TIMEOUT);
    }
    // 4) всё остальное
    this.logger.error('Unexpected RPC error', err.stack || err);
    throw new HttpException(
      'Internal server error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiBody({ type: CreateApplicationDto })
  @ApiResponse({ status: 201, type: ApplicationDto })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateApplicationDto): Promise<ApplicationDto> {
    try {
      return await firstValueFrom(
        this.core.send<ApplicationDto>('applications.create', dto),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Get()
  @ApiOperation({ summary: 'List all applications' })
  @ApiResponse({ status: 200, type: [ApplicationDto] })
  async findAll(): Promise<ApplicationDto[]> {
    try {
      return await firstValueFrom(
        this.core.send<ApplicationDto[]>('applications.findAll', {}),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by ID' })
  @ApiParam({ name: 'id', description: 'UUID of the application' })
  @ApiResponse({ status: 200, type: ApplicationDto })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async findOne(@Param('id') id: string): Promise<ApplicationDto> {
    try {
      return await firstValueFrom(
        this.core.send<ApplicationDto>('applications.findOne', id),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update application status/comment' })
  @ApiParam({ name: 'id', description: 'UUID of the application' })
  @ApiBody({ type: UpdateApplicationDto })
  @ApiResponse({ status: 200, type: ApplicationDto })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationDto,
  ): Promise<ApplicationDto> {
    try {
      // включаем id в DTO
      return await firstValueFrom(
        this.core.send<ApplicationDto>('applications.update', { ...dto, id }),
      );
    } catch (err) {
      this.handleRpcError(err);
    }
  }
}
