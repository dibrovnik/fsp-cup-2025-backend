// api-gateway/src/regions/dto/region.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({
    description: 'ID региона',
    example: '1',
  })
  id: number;

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
