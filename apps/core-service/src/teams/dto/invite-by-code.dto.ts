// src/teams/dto/invite-by-code.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString } from 'class-validator';

export class InviteByCodeDto {
  @ApiProperty({
    description: 'Код приглашения',
    example: 'ABC123',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'UUID пользователя, который использует код',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  userId: string;
}
