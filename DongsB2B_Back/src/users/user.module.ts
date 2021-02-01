import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserResolver } from './users.resolver';
import { UserService } from './user.service';
import { Vertification } from './entities/vertification.entity';


@Module({
    imports:[TypeOrmModule.forFeature([User, Vertification])],
    providers:[UserResolver,UserService],
    exports:[UserService]
})
export class UsersModule {
}
