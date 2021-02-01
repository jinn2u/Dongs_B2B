import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/createAccount.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { JwtService } from "src/jwt/jwt.service";
import { EditProfileInput } from "./dtos/edit-profile.dto";
import { Vertification } from "./entities/vertification.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
        @InjectRepository(Vertification) private readonly vertifications: Repository<Vertification>,
        private readonly jwtService: JwtService
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
            await this.vertifications.save(this.vertifications.create({
                user
            }))
            return {ok: true}
        }catch(e){
            return {ok: false, error: "계정을 생성할수 없습니다."}
        }
        
    }

    async login({email, password}: LoginInput): Promise<{ok: boolean, error?: string, token?: string}>{
//  이메일을 가진 사용자를 찾는다.
        try{
            const user = await this.users.findOne({email},{select:['id','password']})
            if(!user){
                return {ok: false, error: "사용자를 찾을 수 없습니다."}
            }
            // 비밀번호 검증하기 
            const validatePassword = await user.checkPassword(password)
            if(!validatePassword){
                return {ok:false, error:"비밀번호가 잘못되었습니다."}
            }
            // JWT token을 만든 후 사용자에게 준다.
            console.log(user)
            const token = this.jwtService.sign(user.id)
            return{ok: true, token}
        }catch(error) { 
            return{ok: false, error}
        }
    }
    
    async findById(id: number): Promise<User>{
        return this.users.findOne({id})
    }

    async editProfile(id: number, {email, password}: EditProfileInput): Promise<User>{
        // users.update()를 하게 된다면 entity가 있는지 확인하지 않고 바로 db에쿼리를 전송하기 때문에 user entity의 BeforeUpdate()가 실행되지 않는다. 
        // 따라서findOne()을 통하여 user를 찾은 다음 save()를 통하여 BeforeUpdate 데코레이터를 실행한다.
        const user = await this.users.findOne(id)
        console.log(user)
        if(email){
            user.email = email
            await this.vertifications.save(this.vertifications.create({user}))
        }
        if(password){
            user.password = password
        }
        return this.users.save(user)
    }
    async vertifyEmail(code: string): Promise<Boolean>{
        try{
            const vertification = await this.vertifications.findOne({code},{relations: ['user']})
            if(vertification){
                vertification.user.vertified = true
                this.users.save(vertification.user)
                return true
            }
            throw new Error()
        }
        catch(e){
            console.error(e)
            return false
        }
    }
}