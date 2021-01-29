import { UseGuards } from "@nestjs/common";
import { Args, Context, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/createAccount.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.service";

@Resolver(()=> User)
export class UserResolver{
    constructor(private readonly usersService: UserService){}

    @Query(()=> Boolean)
    hi():boolean{
        return true
    }
    // 회원가입
    @Mutation(()=> CreateAccountOutput)
    async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput>{  
        try{
            return this.usersService.createAccount(createAccountInput)
        } catch(error) {
            return{error, ok: false}
        }
    }
    // 로그인
    @Mutation(()=> LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput>{
        try{
            return this.usersService.login(loginInput)
        }catch(error){
            console.error(error)
            return{ok: false, error}
        }
    }
    @Query(()=>User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User){
        return authUser
    }
}