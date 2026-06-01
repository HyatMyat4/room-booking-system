import { IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

type Role = 'admin' | 'owner' | 'user';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsOptional()
  @IsIn(['admin', 'owner', 'user'])
  role?: Role;
}
