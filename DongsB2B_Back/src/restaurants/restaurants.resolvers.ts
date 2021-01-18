import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/createRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";


@Resolver(()=>Restaurant)
export class RestaurantsResolver{
    constructor(private readonly restaurantService: RestaurantService){}

    @Query(()=>[Restaurant])
    restaurants(): Promise<Restaurant[]>{
        return this.restaurantService.getAll()
    }

    @Mutation(()=> Boolean)
    createRestaurant(
       @Args()createRestaurant: CreateRestaurantDto
    ): Boolean {
        
        return true
    }
}``