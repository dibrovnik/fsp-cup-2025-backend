import { ApiProperty } from '@nestjs/swagger';
export class AssignRoleDto {
  @ApiProperty({ example: 'region' }) role: string;
}
