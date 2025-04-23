// api-gateway/src/competitions/dto/competition.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionType, Discipline } from './create-competition.dto';

export class CompetitionDto {
  @ApiProperty({ description: 'UUID соревнования' })
  id: string;

  @ApiProperty({ description: 'Название соревнования' })
  name: string;

  @ApiProperty({ enum: CompetitionType })
  type: CompetitionType;

  @ApiProperty({ enum: Discipline })
  discipline: Discipline;

  @ApiProperty({ description: 'Дата начала в ISO-формате' })
  startDate: string;

  @ApiProperty({ description: 'Дата окончания в ISO-формате' })
  endDate: string;

  @ApiPropertyOptional({ description: 'UUID региона' })
  regionId?: string;
}
