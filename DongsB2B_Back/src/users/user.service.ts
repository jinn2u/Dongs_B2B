import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/createAccount.dto";
import { LoginInput, LoginOutput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput, EditProfileOutput } from "./dtos/edit-profile.dto";
import { Vertification } from "./entities/vertification.entity";
import { UserProfileOutput } from "./dtos/user-profile.dto";
import { VertifyEmailOutput } from "./dtos/vertify-email.dto";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Vertification) private readonly vertifications: Repository<Vertification>,
        private readonly jwtService: JwtService,
        private readonly mailService: MailService
    ){}
    async createAccount({email, password, role}: CreateAccountInput): Promise<{ok: boolean, error?: string}>{
        // 새로운 사용자인지 확인한다.
        try{
            const exists = await this.users.findOne({email})
            //사용자가 존재한다면 
            if(exists){
                return {ok: false, error: "이메일을 가지고 있는 사용자가 존재합니다."}
            }
            //존재하지 않을 경우
            const user = await this.users.save(this.users.create({email, password, role}))
            const vertification = await this.vertifications.save(this.vertifications.create({
                user
            }))
            this.mailService.sendVerificationEmail(user.email, vertification.code)
            return {ok: true}
        }catch(e){
            return {ok: false, error: "계정을 생성할수 없습니다."}
        } 
    }

    async login({email, password}: LoginInput): Promise<LoginOutput>{
    // 이메일을 가진 사용자를 찾는다.
        try{
            const user = await this.users.findOne({email},{select:['id','password']})
            if(!user){
                return {ok: false, error: "사용자를 찾을 수 없습니다."}
            }
            // 비밀번호 검증하기 
            const correctPassword = await user.checkPassword(password)
            if(!correctPassword){
                return {ok:false, error:"비밀번호가 잘못되었습니다."}
            }
            const token = this.jwtService.sign(user.id)
            return {ok: true, token}
        }catch(error) { 
            return {ok: false, error}
        }
    }
    
    //jwt토큰으로 
    async findById(id: number): Promise<UserProfileOutput>{
        try{
            const user = await this.users.findOneOrFail({id})
            return {ok: true, user}
        }catch(e){
            // console.error(e)
            return {ok: false, error:"사용자가 존재하지 않습니다."}
        }
    }

    async editProfile(id: number, {email, password}: EditProfileInput): Promise<EditProfileOutput>{
        // users.update()를 하게 된다면 entity가 있는지 확인하지 않고 바로 db에쿼리를 전송하기 때문에 user entity의 BeforeUpdate()가 실행되지 않는다. 
        // 따라서findOne()을 통하여 user를 찾은 다음 save()를 통하여 BeforeUpdate 데코레이터를 실행한다.
        try{
            const user = await this.users.findOne(id)
            if(email){
                user.email = email
                user.vertified = false //이메일을 변경한다면 다시 메일 인증을 받도록한다.
                const vertification = await this.vertifications.save(this.vertifications.create({user}))
                this.mailService.sendVerificationEmail(user.email,vertification.code)
        }
            if(password){
                user.password = password
            }
            await this.users.save(user)
            return {ok: true}
        }catch(e){
          return { ok: false, error: "프로필을 업데이트할 수 없습니다."};
        }
    }
    async vertifyEmail(code: string): Promise<VertifyEmailOutput>{
        try{
            const vertification = await this.vertifications.findOne({code},{relations: ['user']})
            if(vertification){
                vertification.user.vertified = true
                await this.users.save(vertification.user)
                await this.vertifications.delete(vertification.id)
            return {ok:true}
            }
            return {ok: false, error: "올바른 인증이 아닙니다."}
        }
        catch(e){
            // console.error(e)
            return {ok: false, error: "메일 인증을 할 수 없습니다."}
        }
    }
}