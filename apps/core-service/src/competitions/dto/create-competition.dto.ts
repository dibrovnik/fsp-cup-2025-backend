// api-gateway/src/competitions/dto/create-competition.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { CompetitionType, Discipline, ParticipationFormat } from '../entities/competition.entity';

export class CreateCompetitionDto {
  @ApiProperty({
    description: 'Название соревнования',
    example: 'Весенний хакатон',
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Тип соревнования',
    enum: CompetitionType,
    example: CompetitionType.OPEN,
  })
  @IsEnum(CompetitionType)
  type: CompetitionType;

  @ApiProperty({
    description: 'Дисциплина соревнования',
    enum: Discipline,
    example: Discipline.PRODUCT,
  })
  @IsEnum(Discipline)
  discipline: Discipline;

  @ApiProperty({
    description: 'Дата и время начала в ISO 8601',
    example: '2025-04-19T10:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Дата и время окончания в ISO 8601',
    example: '2025-04-20T18:00:00.000Z',
    type: String,
    format: 'date-time',
  })
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({
    description: 'ID региона (для региональных соревнований)',
    example: 42,
  })
  @IsOptional()
  @IsNumber()
  regionId?: number;

  @ApiProperty({
    enum: ParticipationFormat,
    description: 'Формат участия: solo (индивидуально) или team (командно)',
  })
  @IsEnum(ParticipationFormat)
  participationFormat: ParticipationFormat;
}
