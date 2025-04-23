// api-gateway/src/regions/dto/region.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({
    description: 'UUID региона',
    example: '7a1f8d2e-3b4c-4f5a-9e6d-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'Уникальный код региона (ISO-3166-2)',
    example: 'RU-MOW',
  })
  code: string;

  @ApiProperty({
    description: 'Читабельное название региона',
    example: 'Москва',
  })
  name: string;
}
