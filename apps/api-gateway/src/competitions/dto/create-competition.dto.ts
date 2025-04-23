// api-gateway/src/competitions/dto/create-competition.dto.ts
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum CompetitionType {
  OPEN = 'open',
  REGIONAL = 'regional',
  FEDERAL = 'federal',
}

export enum Discipline {
  PRODUCT = 'product',
  SECURITY = 'security',
  ALGO = 'algo',
  ROBOT = 'robot',
  UAV = 'uav',
}

export class CreateCompetitionDto {
  @ApiProperty({ description: 'Название соревнования' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: CompetitionType })
  @IsEnum(CompetitionType)
  type: CompetitionType;

  @ApiProperty({ enum: Discipline })
  @IsEnum(Discipline)
  discipline: Discipline;

  @ApiProperty({ description: 'Дата начала в ISO-формате' })
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ description: 'Дата окончания в ISO-формате' })
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ description: 'UUID региона (для региональных)' })
  @IsOptional()
  @IsUUID()
  regionId?: string;
}
