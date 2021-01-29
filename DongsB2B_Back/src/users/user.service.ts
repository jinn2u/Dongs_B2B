import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/createAccount.dto";
import { LoginInput } from "./dtos/login.dto";
import { User } from "./entities/user.entity";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "src/jwt/jwt.service";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly users: Repository<User>,
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
            await this.users.save(this.users.create({email, password, role}))
            return {ok: true}
        }catch(e){
            return {ok: false, error: "계정을 생성할수 없습니다."}
        }
        
    }

    async login({email, password}: LoginInput): Promise<{ok: boolean, error?: string, token?: string}>{
//  이메일을 가진 사용자를 찾는다.
        try{
            const user = await this.users.findOne({email})
            if(!user){
                return {ok: false, error: "사용자를 찾을 수 없습니다."}
            }
            // 비밀번호 검증하기 
            const validatePassword = await user.checkPassword(password)
            if(!validatePassword){
                return {ok:false, error:"비밀번호가 잘못되었습니다."}
            }
            // JWT token을 만든 후 사용자에게 준다.
            const token = this.jwtService.sign(user.id)
            return{ok: true, token}
        }catch(error) { 
            return{ok: false, error}
        }
    }
    
    async findById(id: number): Promise<User>{
        return this.users.findOne({id})
    }
}