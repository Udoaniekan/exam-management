import { CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

export class BlockGuard implements CanActivate{
    async canActivate(context:ExecutionContext):Promise<boolean>{

        const request = context.switchToHttp().getRequest();

        const user = request.user
        console.log("BlockGuard triggered. User:", user);

        if(!user || user.isBlocked === true ){
            throw new UnauthorizedException('you are banned from this platform')
        }

        return true;
    }
}