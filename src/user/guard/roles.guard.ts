import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserService } from "../user.service";
import { UserRole } from "../enum/enum";
import { forBiddenRoleException } from "../exception/roles.exception";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<UserRole[]>('roles', context.getHandler());

    // If there are no roles set on the route, allow access by default
    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // JWT user should already be attached by the JwtAuthGuard

    // If the user object doesn't exist, deny access
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(user.role)) {
      throw new ForbiddenException(`User requires one of the following roles: ${roles.join(' or ')}`);
    }

    return true; // Role is valid, grant access
  }
}
