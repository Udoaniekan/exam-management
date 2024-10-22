import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.user';
import { request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './guard/roles';
import { UserRole } from './enum/enum';
import { UpdateRoleDto } from './dto/update.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  // Login route
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res:Response) {
    return this.userService.login(loginDto, res);
  }

  

  @Get('profile')
  @UseGuards(AuthGuard())
  getProfile(@Request() req) {
    console.log(req.user);
    return req.user; // Return the authenticated user's details
  }

  @Get('get-all')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  findAll(){
    return this.userService.getAllUsers()
  }

  @Patch('update-role/:userId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async updateRole(@Param('userId') userId: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.userService.updateRole(userId, updateRoleDto);
  }
}
