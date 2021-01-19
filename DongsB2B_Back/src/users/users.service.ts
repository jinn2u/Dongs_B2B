import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAccountInput } from "./dtos/createAccount.dto";
import { User } from "./entities/user.entity";

@Injectable()
export class UsersService {
    constructor(@InjectRepository(User) private readonly users: Repository<User>){} 

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
        // 새로운 사용자라면 계정을 만들고 비밀번호를 암호화한다.
        
    }
}