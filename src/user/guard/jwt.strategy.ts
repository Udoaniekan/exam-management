import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../user.service";
import { User } from "../schema/user.schema";
import { JwtPayload } from "../jwt.payload";
import { ConfigService } from "@nestjs/config";

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
//     constructor(private userService:UserService)  {
//         super({
//             jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//             ignoreExpiration: false,
//             secretOrKey: process.env.JWT_SECRET,
//         });
//     }

//     async validate (payload: {email}):Promise<User> {
//         const {email} = payload;
//         const user = await this.userService.findEmail(email);
//         if(!user){
//             throw new UnauthorizedException('Login first to access this endpoint')
//         }
//         return user;
//     }
// }
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Bearer header
      ignoreExpiration: false, // Check token expiration
      secretOrKey: configService.get<string>('JWT_SECRET'), // Fetch secret key from environment
    });
  }

  // Validate method to verify the JWT and retrieve the user from the database
  async validate(payload: JwtPayload): Promise<User> {
    console.log('Decoded JWT payload:', payload); // Check if payload is being printed

    const { id } = payload;

    // Fetch the user by the id in the JWT payload
    const user = await this.userService.findUserById(payload.id);

    if (!user) {
      throw new UnauthorizedException('Invalid token or user not found');
    }

    // Return the user object (this is attached to req.user in controllers)
    return user;
  }
}