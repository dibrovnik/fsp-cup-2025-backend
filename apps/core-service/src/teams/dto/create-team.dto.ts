// src/teams/dto/create-team.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty({
    description: 'Название команды',
    example: 'Dream Team',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'UUID пользователя-капитана',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  @IsUUID()
  captainId: string;

  @ApiProperty({
    description: 'ID региона команды',
    example: '1',
  })
  @IsInt()
  regionId: number;

  @ApiProperty({
    description: 'Максимальное количество участников в команде',
    example: 5,
  })
  @IsInt()
  @Min(1)
  maxMembers: number;

  @ApiProperty({
    description: 'Код для приглашения в команду',
    example: 'AB12CD',
  })
  @IsOptional()
  @IsString()
  inviteCode?: string;
}
