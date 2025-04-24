// src/competitions/dto/filter-competitions.dto.ts

import { IsOptional, IsEnum, IsDateString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CompetitionType, Discipline } from '../entities/competition.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterCompetitionsDto {
  @ApiPropertyOptional({
    enum: CompetitionType,
    description: 'Тип соревнования',
  })
  @IsOptional()
  @IsEnum(CompetitionType)
  type?: CompetitionType;

  @ApiPropertyOptional({
    enum: Discipline,
    description: 'Дисциплина соревнования',
  })
  @IsOptional()
  @IsEnum(Discipline)
  discipline?: Discipline;

  @ApiPropertyOptional({ type: Number, description: 'ID региона' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Дата начала от (ISO)',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Дата окончания до (ISO)',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
