import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './schema/user.schema';
import { AdminSeederService } from './admin.seederService';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]), // Connects the User model
  ],
  providers: [AdminSeederService], // Registers the AdminSeederService
  exports: [AdminSeederService], // Export it if other modules need access
})
export class SeederModule {}
