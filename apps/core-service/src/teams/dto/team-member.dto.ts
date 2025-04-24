// api-gateway/src/teams/dto/team-member.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { MemberRole, MemberStatus } from '../entities/team-member.entity';

export class TeamMemberDto {
  @ApiProperty({
    description: 'UUID участника команды',
    example: '4d5e6f78-9abc-1234-def0-56789abcdef0',
  })
  id: string;

  @ApiProperty({
    description: 'UUID команды',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  teamId: string;

  @ApiProperty({
    description: 'UUID пользователя',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  userId: string;

  @ApiProperty({
    description: 'Роль в команде',
    enum: MemberRole,
    example: MemberRole.MEMBER,
  })
  role: MemberRole;

  @ApiProperty({
    description: 'Статус участника',
    enum: MemberStatus,
    example: MemberStatus.PENDING,
  })
  status: MemberStatus;

  @ApiProperty({
    description: 'Дата и время, когда участник присоединился/приглашён',
    type: String,
    format: 'date-time',
  })
  joinedAt: string;

  @ApiProperty({
    description: 'Дата и время последнего изменения статуса',
    type: String,
    format: 'date-time',
  })
  respondedAt: string;
}
