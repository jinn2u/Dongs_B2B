import { Field, Float, InputType, ObjectType, registerEnumType } from "@nestjs/graphql";
import { CoreEntity } from "src/common/entities/core.entity";
import { RestaurantInput } from "src/restaurants/dtos/restaurant.dto";
import { Dish } from "src/restaurants/entities/dish.entity";
import { Restaurant } from "src/restaurants/entities/restaurant.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";

export enum OrderStatus {
    Pending = 'Pending',
    Cooking = 'Cooking',    
    PickedUp = 'PickedUp',
    Delivered ='Delivered' 
}

registerEnumType(OrderStatus, {name: "OrderStatus"})
@InputType('OrderInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class Order extends CoreEntity {
    
    @Field(()=> User, {nullable: true})
    @ManyToOne(() => User, user => user.orders, { nullable: true, onDelete: 'SET NULL'})
    customer?: User
    
    @Field(()=> User, {nullable: true})
    @ManyToOne(() => User, user => user.rides, { nullable: true, onDelete: 'SET NULL'})
    driver: User

    @Field(()=>Restaurant)
    @ManyToOne(() => Restaurant, restaurant => restaurant.orders, { nullable: true, onDelete: 'SET NULL'})
    restaurant: Restaurant

    @Field(()=>[Dish])
    @ManyToMany(()=> Dish)
    @JoinTable()
    dishes: Dish[]

    @Column({nullable:true})
    @Field(()=>Float, {nullable:true})
    total?: number
    
    @Column({type:"enum", enum: OrderStatus})
    @Field(()=>OrderStatus)
    status: OrderStatus

}