import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { IsString, Length } from "class-validator";
import { CoreEntity } from "src/common/entities/core.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Restaurant } from "./restaurant.entity";


@InputType("CategoryInput", {isAbstract: true})
@ObjectType()
@Entity()
export class Category  extends CoreEntity{
    @PrimaryGeneratedColumn()
    @Field(()=>Number)
    id: number

    @Field(()=> String)
    @Column()
    @IsString()
    @Length(5)
    name: string
    
    @Field(()=> String)
    @Column()
    @IsString()
    coverImage: string

    @Field(()=> Restaurant)
    @OneToMany(()=> Restaurant, restaurant => restaurant.category)
    restaurants: Restaurant[]
}