import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsUUID, IsOptional, IsString } from 'class-validator';
import { ApplicationStatus } from '../entities/application.entity';


export class UpdateApplicationDto {
  @ApiProperty({
    description: 'UUID заявки',
    example: '9b2d7e11-3d45-4f6a-8c2d-abcdef123456',
  })
  @IsUUID()
  id: string;

  @ApiProperty({ description: 'Новый статус заявки', enum: ApplicationStatus })
  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;

  @ApiPropertyOptional({
    description: 'Комментарий модератора',
    example: 'Не прошли по региону',
  })
  @IsOptional()
  @IsString()
  comment?: string;
}
