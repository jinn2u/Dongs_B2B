import { Module } from '@nestjs/common';
 import { TypeOrmModule } from '@nestjs/typeorm';
 import { User } from './entities/user.entity';
 import { UserResolver } from './users.resolver';
 import { UserService } from './user.service';
import { ConfigService } from '@nestjs/config';

@Module({
    imports:[TypeOrmModule.forFeature([User]), ConfigService],
    providers:[UserResolver,UserService]
})
export class UsersModule {
}
