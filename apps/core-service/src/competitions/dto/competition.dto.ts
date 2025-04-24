// api-gateway/src/competitions/dto/competition.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionType, Discipline, ParticipationFormat } from '../entities/competition.entity';
import { RegionDto } from 'apps/users-service/src/regions/dto/region.dto';

export class CompetitionDto {
  @ApiProperty({ description: 'UUID соревнования' })
  id: string;

  @ApiProperty({ description: 'Название соревнования' })
  name: string;

  @ApiProperty({ enum: CompetitionType, description: 'Тип соревнования' })
  type: CompetitionType;

  @ApiProperty({ enum: Discipline, description: 'Дисциплина соревнования' })
  discipline: Discipline;

  @ApiProperty({ description: 'Дата и время начала в ISO 8601' })
  startDate: string;

  @ApiProperty({ description: 'Дата и время окончания в ISO 8601' })
  endDate: string;

  @ApiPropertyOptional({ type: RegionDto, description: 'Данные региона' })
  region?: RegionDto;

  @ApiProperty({
    enum: ParticipationFormat,
    description: 'Формат участия: solo или team',
  })
  participationFormat: ParticipationFormat;
}
