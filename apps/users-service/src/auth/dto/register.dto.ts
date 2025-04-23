import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString() 
  @MinLength(6) 
  password: string;

  @IsString() f
  first_name: string;

  @IsString() 
  last_name: string;

  regionId: number; // FK на Region
}
