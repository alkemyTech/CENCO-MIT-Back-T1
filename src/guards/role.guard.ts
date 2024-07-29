import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../user/entities/role.enum";
import { ROLES_KEY } from "../decorators/has-roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    const hasRequiredRole = requiredRoles.some((role) => user?.role?.includes(role));

    if (!hasRequiredRole) {
      throw new UnauthorizedException("You don't have the required permission to execute this action");
    }
    return true;
  }

}
