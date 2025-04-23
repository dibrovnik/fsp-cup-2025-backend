import { ApiProperty } from '@nestjs/swagger';
export class AssignRoleDto {
  @ApiProperty({ example: 'd23d86dd-cd6d-40ce-86f1-6c1f0100e96f' }) id: string;
  @ApiProperty({ example: 'region' }) role: string;
}
