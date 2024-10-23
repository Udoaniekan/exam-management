import { IsEnum } from 'class-validator';
import { UserRole } from '../enum/enum';

export class UpdateRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}
