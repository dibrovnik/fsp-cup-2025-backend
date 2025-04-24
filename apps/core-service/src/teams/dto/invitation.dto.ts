// api-gateway/src/teams/dto/invitation.dto.ts

import { ApiProperty } from '@nestjs/swagger';

export class InvitationDto {
  @ApiProperty({
    description: 'UUID приглашения',
    example: '7a1f8d2e-3b4c-4f5a-9e6d-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'UUID команды, для которой создано приглашение',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  teamId: string;

  @ApiProperty({
    description: 'Одноразовый токен-приглашение',
    example: 'a1b2c3d4e5f6g7h8',
  })
  token: string;

  @ApiProperty({
    description: 'UUID пользователя, создавшего приглашение',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  createdBy: string;

  @ApiProperty({
    description: 'Дата и время истечения срока действия приглашения',
    type: String,
    format: 'date-time',
  })
  expiresAt: string;

  @ApiProperty({
    description: 'Оставшееся количество использований токена',
    example: 1,
  })
  usesLeft: number;

  @ApiProperty({
    description: 'Дата и время создания приглашения',
    type: String,
    format: 'date-time',
  })
  createdAt: string;
}
