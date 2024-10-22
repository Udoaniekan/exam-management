import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { UserRole } from "../enum/enum";

export type UserDocument = HydratedDocument<User>;
// export type UserDocument = User & Document

@Schema() 
export class User {
    @Prop()
    firstName:string;

    @Prop()
    lastName:string;
    
    @Prop()
    password:string;
    
    @Prop()
    email:string;
    
    @Prop()
    DOB:string;
    
    @Prop({default:false})
    isBlocked:boolean;

    @Prop({enum: UserRole, default: UserRole.STUDENT }) // Default role is 'student'
    role: UserRole; // Use the UserRole enum here

    
}
export const userSchema =SchemaFactory.createForClass(User)



