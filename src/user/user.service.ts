import {
  HttpException,
  Injectable,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/loginDto.user';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UpdateRoleDto } from './dto/update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(payload: CreateUserDto) {
    payload.email = payload.email.toLowerCase();
    const { email, password, ...result } = payload;
    const user = await this.userModel.findOne({ email });

    if (user) {
      throw new UnauthorizedException('email already exist');
    }
    const newPassword = await bcrypt.hash(password, 10);

    try {
      const signUp = new this.userModel({
        email,
        password: newPassword,
        ...result,
      });
      await signUp.save();
      const { password: _, ...userWithoutPassword } = signUp.toObject();
      return {
        message: 'successfully',
        result: userWithoutPassword,
      };
    } catch (error) {
      throw new Error('Error saving user to database: ' + error.message);
    }
  }

  async login(payload: LoginDto, @Res() res: Response) {
    const { email, password } = payload;

    const user = await this.userModel.findOne({ email }).select('+password'); 

    if (!user) {
      throw new HttpException('Invalid credentials', 404); 
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new HttpException('Invalid credentials', 404); 
    }

    
    const token = await this.jwtService.signAsync({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    res.cookie('userAuthentication', token, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000,
      sameSite: 'none',
      secure: true,
    });

    user.password = undefined;

    return res.send({
      message: 'User login successful',
      userToken: token,
      userDetails: user,
    });
  }

  async findEmail(email: string) {
    const user = await this.userModel.findOne({ email: email });

    if (!user) {
      throw new UnauthorizedException();
    } else {
      return user;
    }
  }

  async user(headers: any): Promise<any> {
    const authorizationHeader = headers.authorization;

    if (authorizationHeader) {
      // Extract the token from the 'Bearer' format
      const token = authorizationHeader.replace('Bearer', '').trim();

      try {
        // Decode the JWT to extract the payload
        const decoded = this.jwtService.verify(token);

        // Extract the user ID from the decoded token
        const id = decoded['id'];

        const user = await this.userModel.findById(id).exec(); 

        if (!user) {
          throw new UnauthorizedException('User not found');
        }

        return {
          id: user._id, // Use _id as it's MongoDB's identifier
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        };
      } catch (error) {
        throw new UnauthorizedException('Invalid token');
      }
    } else {
      throw new UnauthorizedException('Invalid or missing Bearer token');
    }
  }

  async findUserById(userId: string): Promise<User | null> {
    return this.userModel.findById(userId).exec(); // Fetch the user by ID from MongoDB
  }

  async getAllUsers() {
    return await this.userModel.find();
  }

  async updateRole(userId: string, updateRoleDto: UpdateRoleDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Update the role
    user.role = updateRoleDto.role;
    await user.save();

    return { message: `User role updated to ${updateRoleDto.role}` };
  }

  async logout(@Res() res: Response) {
    const clearCookie = res.clearCookie('userAuthentication');

    const response = res.send(`user successfully logout`);

    return {
      clearCookie,
      response,
    };
  }
}
