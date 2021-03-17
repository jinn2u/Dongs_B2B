import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { PaginationInput, PaginationOutput } from "src/common/dtos/pagination.dto";
import { Restaurant } from "../entities/restaurant.entity";


@InputType()
export class RestaurantsInput extends PaginationInput{}

@ObjectType()
export class RestaurantsOutput extends PaginationOutput{
    @Field(()=> [Restaurant], {nullable: true})
    results?: Restaurant[]
}
 