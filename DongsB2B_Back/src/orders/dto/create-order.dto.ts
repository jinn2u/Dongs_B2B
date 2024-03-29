import { Field, InputType, Int, ObjectType, PickType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { DishOption } from "src/restaurants/entities/dish.entity";
import { Order } from "../entities/order.entity";

@InputType()
class CreateOrderItemInput{
    @Field(()=>Int)
    dishId: number

    @Field(()=> DishOption, {nullable: true})
    options?: DishOption[]
}

@InputType()
export class CreateOrderInput{
    @Field(()=> Int)
    restaurantId: number
    
    @Field(()=> [CreateOrderItemInput])
    items: CreateOrderItemInput[]
}

@ObjectType()
export class CreateOrderOutput extends CoreOutput{}
