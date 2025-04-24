// api-gateway/src/teams/dto/team.dto.ts

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TeamStatus } from '../entities/team.entity';
import { TeamMemberDto } from './team-member.dto';
import { InvitationDto } from './invitation.dto';

export class TeamDto {
  @ApiProperty({
    description: 'UUID команды',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({ description: 'Название команды', example: 'Dream Team' })
  name: string;

  @ApiProperty({
    description: 'UUID пользователя-капитана',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  captainId: string;

  @ApiProperty({
    description: 'UUID региона команды',
    example: '1',
  })
  regionId: number;

  @ApiProperty({
    description: 'Максимальное количество участников в команде',
    example: 5,
  })
  maxMembers: number;

  @ApiProperty({
    description: 'Код для приглашения в команду',
    example: 'AB12CD',
  })
  inviteCode: string;

  @ApiProperty({
    enum: TeamStatus,
    description: 'Текущий статус команды',
    example: TeamStatus.RECRUITING,
  })
  status: TeamStatus;

  @ApiProperty({
    description: 'Дата и время создания команды',
    type: String,
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Дата и время последнего обновления команды',
    type: String,
    format: 'date-time',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    type: [TeamMemberDto],
    description: 'Список участников команды',
  })
  members?: TeamMemberDto[];

  @ApiPropertyOptional({
    type: [InvitationDto],
    description: 'Список активных приглашений',
  })
  invitations?: InvitationDto[];
}
