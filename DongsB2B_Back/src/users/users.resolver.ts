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
        try{
            return this.userService.createAccount(createAccountInput)
        } catch(error) {
            return{error, ok: false}
        }
    }
    // 로그인
    @Query(()=> LoginOutput)
    async login(@Args('input') loginInput: LoginInput): Promise<LoginOutput>{
        try{
            return this.userService.login(loginInput)
        }catch(error){
            console.error(error)
            return{ok: false, error}
        }
    }
    // 본인 인증
    @Query(()=>User)
    @UseGuards(AuthGuard)
    me(@AuthUser() authUser: User){
        return authUser
    }
    // 사용자의 프로필을 전달해준다.
    @UseGuards(AuthGuard)
    @Query(()=>UserProfileOutput)
    async userProfile(@Args() userProfileInput: UserProfileInput): Promise<UserProfileOutput>{
        try{
            const user = await this.userService.findById(userProfileInput.userId)
            if(!user){
                throw Error()
            }
            return {
                ok: true,
                user
            }
        } catch (e) {
            console.error(e)
            return {
                error: "사용자가 존재하지 않습니다.",
                ok: false
            }
        }
    }
    // 프로필 수정하기
    @UseGuards(AuthGuard)
    @Mutation(()=>EditProfileOutput)
    async editProfile(@AuthUser() authUser: User, @Args('input') editProfileInput: EditProfileInput): Promise<EditProfileOutput>{
        try{
            await this.userService.editProfile(authUser.id, editProfileInput)
            return {
                ok: true
            }
        }catch(e){
            console.error(e)
            return {
                ok:false,
                error: e
            }
        }
    }
    @Mutation(()=>VertifyEmailOutput)
    async vertifyEmail(@Args('input'){code}: VertifyEmailInput): Promise<VertifyEmailOutput>{
        try{
            await this.userService.vertifyEmail(code)
            return {ok: true}
        }catch(e){
            return{ok: false, error: e}
        }
    }
}