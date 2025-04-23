// apps/api-gateway/src/gateway.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Service')
@Controller()
export class GatewayController {
  @Get('health')
  @ApiOperation({ summary: 'Проверить статус сервиса (healthcheck)' })
  @ApiResponse({
    status: 200,
    description: 'Сервис работает, готов принимать запросы',
    schema: {
      example: { status: 'ok' },
    },
  })
  health() {
    return { status: 'ok' };
  }
}
