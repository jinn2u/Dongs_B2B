import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/createRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";


@Resolver()
export class RestaurantsResolver{
    @Query(() => [Restaurant])
    restaurants(
        @Args('veganOnly')veganOnly:Boolean 
    ):Restaurant[] {
        return []
    }

    @Mutation(()=> Boolean)
    createRestaurant(
       @Args()createRestaurant: CreateRestaurantDto
    ): Boolean {
        
        return true
    }
}