import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { User } from './entities/user.entity';
 import { UserResolver } from './users.resolver';
 import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from 'src/jwt/jwt.module';

@Module({
    imports:[TypeOrmModule.forFeature([User])],
    providers:[UserResolver,UserService]
})
export class UsersModule {
}
