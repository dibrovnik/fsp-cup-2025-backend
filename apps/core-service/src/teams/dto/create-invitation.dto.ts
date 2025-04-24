// src/teams/dto/create-invitation.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'UUID команды',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  teamId: string;

  @ApiProperty({
    description: 'UUID пользователя, создавшего приглашение',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  createdBy: string;

  @ApiProperty({
    description: 'Использований осталось',
    example: '3',
  })
  @IsOptional()
  @Min(1)
  @IsInt()
  usesLeft?: number;
}
