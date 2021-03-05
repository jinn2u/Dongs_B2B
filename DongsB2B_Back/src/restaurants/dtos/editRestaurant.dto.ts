import { InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { CoreOutput } from "src/common/dtos/output.dto";
import { CreateRestaurantInput } from "./createRestaurant.dto";



@InputType()
export class EditRestaurantInput extends PartialType(CreateRestaurantInput){}

@ObjectType()
export class EditRestaurantOutput extends CoreOutput{}