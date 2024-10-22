import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./schema/user.schema";
import { Model } from "mongoose";
import * as bcrypt from 'bcrypt';
import { UserRole } from "./enum/enum";

@Injectable()
export class AdminSeederService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async seedAdmin() {
    const superAdminExists = await this.userModel.findOne({ email: 'danny@email.com' });
    if (superAdminExists) {
      console.log('super-dmin user already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash('AdminPassword12$', 10);
    const superAdminUser = new this.userModel({
      firstName: 'Danny',
      lastName: 'Ekong',
      email: 'danny@email.com',
      password: hashedPassword,
      role: UserRole.SUPERADMIN, // Set the role to ADMIN
    }); 
    

    await superAdminUser.save();
    console.log('super-admin user created.');
  }
}
