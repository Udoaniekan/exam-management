import { Module, OnModuleInit } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SeederModule } from './user/adminseeder.module';
import { AdminSeederService } from './user/admin.seederService';

@Module({
  imports: [
      ConfigModule.forRoot({ isGlobal: true }),
      MongooseModule.forRoot(process.env.DB_URI),
      UserModule, SeederModule
    ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly AdminSeederService:AdminSeederService) {}

  async onModuleInit() {
    // Call the seedAdmin function to insert admin if not present
    await this.AdminSeederService.seedAdmin();
  }
}

