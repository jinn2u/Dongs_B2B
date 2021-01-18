import { Args, ArgsType, Field, InputType, PartialType } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./createRestaurant.dto";

@InputType()
class UpdateRestaurantInputType extends PartialType(CreateRestaurantDto){}

@ArgsType()
export class UpdateRestaurantDto {
    @Field(()=> Number)
    id: number

    @Field(()=> UpdateRestaurantInputType)
    data: UpdateRestaurantInputType
}