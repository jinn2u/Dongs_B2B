import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { AuthGuard } from "src/auth/auth.guard";
import { CreateAccountInput, CreateAccountOutput } from "./dtos/createAccount.dto";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { UserProfileInput, UserProfileOutput } from "./dtos/user-profile.dto";
import { VertifyEmailInput, VertifyEmailOutput } from "./dtos/vertify-email.dto";
import { User } from "./entities/user.entity";
import { Vertification } from "./entities/vertification.entity";
import { UserService } from "./user.service";

@Resolver(()=> User)
export class UserResolver{
    constructor(private readonly userService: UserService){}

    // 회원가입
    @Mutation(()=> CreateAccountOutput)
    async createAccount(@Args('input') createAccountInput: CreateAccountInput): Promise<CreateAccountOutput>{  
        return this.userService.createAccount(createAccountInput)
    }
    // 로그인
    @Query(()=> LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput>{
        return this.userService.login(loginInput)
    }
    // 내가 누구인지를 보여준다.
    @Query(()=>User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User){
        return authUser
    }
    // 사용자의 프로필을 반환한다.
    @UseGuards(AuthGuard)
    @Query(()=>UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput>{
        return this.userService.findById(userProfileInput.userId)
    }
    // 프로필 수정하기
    @UseGuards(AuthGuard)
    @Mutation(()=>EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput>{
        return this.userService.editProfile(authUser.id, editProfileInput)
    }
    @Mutation(()=>VertifyEmailOutput)
    async vertifyEmail(@Args('input'){code}: VertifyEmailInput): Promise<VertifyEmailOutput>{
        return this.userService.vertifyEmail(code)
    }
}