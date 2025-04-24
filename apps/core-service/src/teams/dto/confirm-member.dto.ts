// src/teams/dto/confirm-member.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsBoolean } from 'class-validator';

export class ConfirmMemberDto {
  @ApiProperty({
    description: 'UUID команды',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  teamId: string;

  @ApiProperty({
    description: 'UUID пользователя',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Подтверждение участия в команде',
    example: 'true',
  })
  @IsBoolean()
  accept: boolean;
}
