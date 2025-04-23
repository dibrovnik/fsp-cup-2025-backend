// src/competitions/dto/create-competition.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { CompetitionType, Discipline } from '../entities/competition.entity';

export class CreateCompetitionDto {
  @IsNotEmpty() name: string;
  @IsEnum(CompetitionType) type: CompetitionType;
  @IsEnum(Discipline) discipline: Discipline;
  @IsNotEmpty() startDate: string; // ISO
  @IsNotEmpty() endDate: string; // ISO
  @IsOptional() @IsUUID() regionId?: string;
}
