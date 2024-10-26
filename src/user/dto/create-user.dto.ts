import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'sorry you must put in 8 characters' })
  @MaxLength(16, { message: 'password should not be more than 16 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/, {
    message:
      'password must contain at least one Uppercase, One number and One special key',
  })
  password: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

}
