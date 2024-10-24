import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserRole } from '../enum/enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop()
  DOB: string;

  @Prop({ default: false })
  isBlocked: boolean;

  @Prop({ enum: UserRole, default: UserRole.STUDENT }) 
  role: UserRole; 
}
export const userSchema = SchemaFactory.createForClass(User);
