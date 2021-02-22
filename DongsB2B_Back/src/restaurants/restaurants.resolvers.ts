import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CreateRestaurantDto } from "./dtos/createRestaurant.dto";
import { UpdateRestaurantDto } from "./dtos/updateRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(()=>Restaurant)
export class RestaurantsResolver{
    constructor(
        private readonly restaurantService: RestaurantService
    ){}

    @Query(()=>[Restaurant])
    restaurants(): Promise<Restaurant[]>{
        return this.restaurantService.getAll()
    }

    @Mutation(()=> Boolean)
    async createRestaurant(
        @Args('input')createRestaurantDto: CreateRestaurantDto
    ): Promise<boolean> { 
        try{
            await this.restaurantService.createRestaurant(createRestaurantDto)
            return true
        } catch(e) {
            console.error(e)
            return false
        }
    }
    
    @Mutation(()=> Boolean)
    async udpateRestaurant(@Args()updateRestaurantDto:UpdateRestaurantDto): Promise<boolean>{
        try{
            await this.restaurantService.updateRestaurant(updateRestaurantDto)
            return true
        }  catch(e) {
            console.error(e)
            return false 
        }
    }
}