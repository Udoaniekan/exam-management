import { HttpException, Injectable, Res, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { LoginDto } from "./dto/login.user";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";
import { UpdateRoleDto } from "./dto/update.dto";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly jwtService: JwtService
  ) {}

  async signUp(payload: CreateUserDto){
    payload.email = payload.email.toLowerCase();
    const { email, password, ...result } = payload;
    const user = await this.userModel.findOne({email});

    if (user) {
      throw new UnauthorizedException('email already exist');
    }
    const newPassword = await bcrypt.hash(password, 10);

    try {
      const signUp = new this.userModel({email, password:newPassword, ...result});
    await signUp.save();
    const { password: _, ...userWithoutPassword } = signUp.toObject();
    return {
      message: 'successfully',
      result: userWithoutPassword,
      
    };
    } catch  (error){
      throw new Error('Error saving user to database: ' + error.message);
    }
    
  }

  async login(payload: LoginDto, @Res() res: Response) {
    const { email, password } = payload;
  
    // Find the user by email in MongoDB
    const user = await this.userModel.findOne({ email }).select('+password'); // Selecting the password field explicitly if it's set to not be selected by default
  
    if (!user) {
      throw new HttpException('Invalid credentials', 404); // Throw exception if user is not found
    }
  
    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      throw new HttpException('Invalid credentials', 404); // Throw exception if passwords don't match
    }
  
    // Create JWT token if credentials are valid
    const token = await this.jwtService.signAsync({
      id: user._id,
      email: user.email,
      role: user.role,
    });
  
    // Set the token as a cookie in the response
    res.cookie('userAuthentication', token, {
      httpOnly: true,
      maxAge: 1 * 60 * 60 * 1000, // 1 hour expiration
      sameSite: 'none',
      secure: true,
    });
  
    // Optionally, delete the password field before sending user details back
    user.password = undefined;
  
    return res.send({
      message: 'User login successful',
      userToken: token,
      userDetails: user,
    });
  }
  
  async findEmail(email:string){
    const user = await this.userModel.findOne({email:email});
  
    if(!user){
      throw new UnauthorizedException();
    }else{
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
  
        // Find the user in the database by _id (MongoDB uses _id)
        const user = await this.userModel.findById(id).exec(); // .exec() to handle async Mongoose query
  
        if (!user) {
          throw new UnauthorizedException('User not found');
        }
  
        // Return the user's details
        return {
          id: user._id,  // Use _id as it's MongoDB's identifier
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role
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

  async getAllUsers(){
    return await this.userModel.find()
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

}