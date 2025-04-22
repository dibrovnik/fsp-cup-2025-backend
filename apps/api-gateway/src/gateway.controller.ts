// apps/api-gateway/src/gateway.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ClientProxy, Payload, Ctx, RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller('api') // префикс для всех эндпоинтов
export class GatewayController {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('CORE_SERVICE') private coreClient: ClientProxy,
  ) {}

  // Прокидываем GET /api/users → users-service@TCP:{ cmd: 'users_findAll' }
  @Get('users')
  async findAllUsers() {
    return this.usersClient.send({ cmd: 'users_findAll' }, {});
  }

  // Прокидываем GET /api/competitions → core-service@TCP:{ cmd: 'competitions_findAll' }
  @Get('competitions')
  async findAllCompetitions() {
    return this.coreClient.send({ cmd: 'competitions_findAll' }, {});
  }

  // POST /api/users
  @Post('users')
  async createUser(@Body() dto: any) {
    return this.usersClient.send({ cmd: 'users_create' }, dto);
  }
}
