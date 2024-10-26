import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/loginDto.user';
import { request, Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from './guard/roles.guard';
import { Roles } from './guard/roles';
import { UserRole } from './enum/enum';
import { UpdateRoleDto } from './dto/update.dto';
import { BlockGuard } from './guard/blockGuard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
//signup route
  @Post('signup')
  async signUp(@Body() createUserDto: CreateUserDto) {
    return this.userService.signUp(createUserDto);
  }

  // Login route
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.userService.login(loginDto, res);
  }
// Get user profile route (only accessible to authenticated users)
  @Get('profile')
  @UseGuards(AuthGuard(), BlockGuard)
  getProfile(@Request() req) {
    console.log(req.user);
    return req.user; // Return the authenticated user's details
  }

  // Get all users route (only accessible to super admins)
  @Get('get-all')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  findAll() {
    return this.userService.getAllUsers();
  }
// Update user role route (only accessible to super admins)
  @Patch('update-role/:userId')
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles(UserRole.SUPERADMIN)
  async updateRole(
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.userService.updateRole(userId, updateRoleDto);
  }
// Logout route (only accessible to authenticated users)
  @HttpCode(200)
  @Post('logout')
  async logout(
    @Res()
    res: Response,
  ) {
    return await this.userService.logout(res);
  }

  @UseGuards(AuthGuard(), BlockGuard)
  @Roles(UserRole.SUPERADMIN)
@Post('blockuser/:id')
async blockUser(@Param('id') id:string){
  return await this.userService.blockUser(id)
}

@UseGuards(AuthGuard(), BlockGuard)
@Post('unblockuser/:id')
async unblockUser(@Param('id') id:string){
  return await this.userService.unblockUser(id)
}
}
