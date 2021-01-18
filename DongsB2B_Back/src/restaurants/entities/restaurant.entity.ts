import { Field, ObjectType } from "@nestjs/graphql";
import { IsBoolean, IsOptional, IsString, Length } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class Restaurant{
    @PrimaryGeneratedColumn()
    @Field(()=>Number)
    id: number

    @Field(()=> String)
    @Column()
    @IsString()
    @Length(5)
    name: string
    
    @Field(()=>Boolean, {defaultValue: true})
    @Column({default: true})
    @IsOptional()
    @IsBoolean()
    isVegan: boolean

    @Field(()=> String)
    @Column()
    @IsString()
    address: string
}