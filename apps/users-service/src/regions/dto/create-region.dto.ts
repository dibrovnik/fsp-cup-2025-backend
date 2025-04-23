// src/regions/dto/create-region.dto.ts
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRegionDto {
  @ApiProperty({ description: 'Уникальный код региона (например, RU-MOW)' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ description: 'Название региона' })
  @IsString()
  @IsNotEmpty()
  name: string;
 
}
