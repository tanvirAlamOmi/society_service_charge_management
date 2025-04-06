 import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
 
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
      }
    
      canActivate(context: ExecutionContext) {

        const request = context.switchToHttp().getRequest();
        if (request.method === 'OPTIONS') {
          return true; // Skip authentication for OPTIONS requests
        }
        // Check if the route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
          context.getHandler(),
          context.getClass(),
        ]);
    
        // If the route is public, allow access without authentication
        if (isPublic) {
          return true;
        }
    
        // Otherwise, proceed with JWT authentication
        console.log('Route is protected, checking JWT...'); 
        return super.canActivate(context);
      }
}