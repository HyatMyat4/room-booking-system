import { IsIn, IsNotEmpty } from 'class-validator';

type Role = 'admin' | 'owner' | 'user';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsIn(['admin', 'owner', 'user'])
  role!: Role;
}
