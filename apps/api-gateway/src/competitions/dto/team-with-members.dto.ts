// src/competitions/dto/team-with-members.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class TeamWithMembersDto {
  @ApiProperty({ description: 'UUID команды' })
  teamId: string;

  @ApiProperty({
    description: 'Список UUID участников команды',
    type: [String],
  })
  members: string[];
}
