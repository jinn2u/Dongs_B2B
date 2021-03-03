import { Field, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import * as bcrypt from "bcrypt"
import { InternalServerErrorException } from "@nestjs/common";
import { IsEmail, IsEnum } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";

enum UserRole{
    Owner,
    Client,
    Delivrey
}

registerEnumType(UserRole, {name: "UserRole"})

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class User extends CoreEntity {

    @Column({unique: true})
    @Field(()=>String)
    @IsEmail()
    email: string
 
    @Column({select: false})
    @Field(()=>String)
    password: string

    @Column({default: false})
    @Field(()=>Boolean)
    vertified: boolean


    @Column({type:'enum', enum: UserRole})
    @Field(()=> UserRole)
    @IsEnum(UserRole)
    role: UserRole

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void>{
        if(this.password){
            try{
                this.password = await bcrypt.hash(this.password, 10)
            } catch (e){
                console.error(e)
                throw new InternalServerErrorException()
            }
        }
    }
    async checkPassword(InputPassword: string): Promise<boolean>{
        try{
            return bcrypt.compare(InputPassword, this.password)
        }catch(error){
            console.error(error)
            throw new InternalServerErrorException()
        }
    }
}