import { SetMetadata } from "@nestjs/common";
import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { Role } from "src/auth/role.decorator";
import { User, UserRole } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/createRestaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";

@Resolver(()=>Restaurant)
export class RestaurantsResolver{
    constructor(
        private readonly restaurantService: RestaurantService
    ){}

    @Mutation(()=> CreateRestaurantOutput)
    @Role(['Owner'])
    async createRestaurant( 
        @AuthUser() authUser: User,
        @Args('input')createRestaurantInput: CreateRestaurantInput
    ): Promise<CreateRestaurantOutput> { 
        return this.restaurantService.createRestaurant(authUser, createRestaurantInput)
    }
}