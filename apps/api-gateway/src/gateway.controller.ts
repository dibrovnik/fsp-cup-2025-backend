// apps/api-gateway/src/gateway.controller.ts
import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ClientProxy, Payload, Ctx, RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

@Controller() 
export class GatewayController {
  constructor(
    @Inject('USERS_SERVICE') private usersClient: ClientProxy,
    @Inject('CORE_SERVICE') private coreClient: ClientProxy,
  ) {}
}
