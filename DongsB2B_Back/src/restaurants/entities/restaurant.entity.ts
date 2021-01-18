import { Field, ObjectType } from "@nestjs/graphql";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant{
    @PrimaryGeneratedColumn()
    @Field(()=>Number)
    id: number

    @Column()
    @Field(()=> String)
    name: string
    
    @Column()
    @Field(()=> Boolean,{nullable:true})
    isGood?: Boolean

    @Column()
    @Field(()=> String)
    address: string
    
    @Column()
    @Field(()=> String)
    ownerName: string

    @Column()
    @Field(()=> String)
    categoryName: string
}