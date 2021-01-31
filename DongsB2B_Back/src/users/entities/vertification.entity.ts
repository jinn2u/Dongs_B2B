import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { User } from "./user.entity";

@InputType({isAbstract: true})
@ObjectType()
@Entity()
export class Vertification extends CoreEntity{
 
    @Column()
    @Field(()=>String)
    code: string

    @OneToOne(()=> User)
    @JoinColumn()
    user: User
}