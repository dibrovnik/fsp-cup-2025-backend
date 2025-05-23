// src/teams/dto/join-by-link.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class JoinByLinkDto {
  @ApiProperty({
    description: 'Код приглашения',
    example: 'ABC123',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'UUID пользователя, который использует код',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  userId: string;
}
