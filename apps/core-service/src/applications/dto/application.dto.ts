import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CompetitionDto } from '../../competitions/dto/competition.dto';
import { TeamDto } from '../../teams/dto/team.dto';
import { ApplicationStatus } from '../entities/application.entity';


export class ApplicationDto {
  @ApiProperty({
    description: 'UUID заявки',
    example: '58da9872-0fc3-4154-86b5-51b7c624a4a2',
  })
  id: string;

  @ApiProperty({ description: 'Соревнование', type: CompetitionDto })
  competition: CompetitionDto;

  @ApiPropertyOptional({
    description: 'Команда (если командная заявка)',
    type: TeamDto,
  })
  team?: TeamDto;

  @ApiPropertyOptional({
    description: 'UUID пользователя (если индивидуальная)',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  userId?: string;

  @ApiProperty({ description: 'Статус заявки', enum: ApplicationStatus })
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Комментарий модератора',
    example: 'Регион не совпадает',
  })
  comment?: string;

  @ApiProperty({
    description: 'Дата подачи заявки',
    type: String,
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Дата последнего обновления',
    type: String,
    format: 'date-time',
  })
  updatedAt: string;
}
