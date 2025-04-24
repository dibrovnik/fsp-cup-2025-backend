import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsUUID, IsOptional, ValidateIf } from 'class-validator';

export class CreateApplicationDto {
  @ApiProperty({
    description: 'UUID соревнования',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  competitionId: string;

  @ApiPropertyOptional({ description: 'UUID команды для командной заявки' })
  @ValidateIf((o) => !!o.teamId)
  @IsUUID()
  @IsOptional()
  teamId?: string;

  @ApiPropertyOptional({
    description: 'UUID пользователя для индивидуальной заявки',
  })
  @ValidateIf((o) => !o.teamId)
  @IsUUID()
  @IsOptional()
  userId?: string;
}
